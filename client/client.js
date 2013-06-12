var markerArray = [];

Template.lines.routes = function () {
    var r = Routes.find({}, {sort: {route_id : 1}});
    return r;
};

Template.selectedline.route = function () {
    var r = Routes.findOne({route_id: Session.get('routeselected')});
    return r;
};

Template.selectedline.displaydirection = function() {
   if (Session.get('destination') == "1" ) {
      return "<<<<"
   } else {
      return ">>>>"
   };
}
Template.lines.events({
    'click .routeicon': function(event){
    
        console.log("clicked on " + this.route_id)
        var previous_routeselected = Session.get('routeselected')
        
        if (this.route_id !== previous_routeselected) {
        
            var previous_destination =  Session.get('destination')
            Session.set('routeselected', this.route_id)
            Session.set('destination', "0")
            
            updateMonitor(previous_routeselected, previous_destination, this.route_id, "0")
            
            if (typeof fireupdate !== "undefined") {
                console.log("clearInterval")
                Meteor.clearInterval(fireupdate)
            }
            updateSelected()
            console.log("lauching timer for update in 60s")
            fireupdate = Meteor.setInterval(function() {
                updateSelected()
            }, 60000)
        }
    }
});

function updateMonitor(previous_routeselected, previous_destination, routeselected, destination) {
    console.log("updateMonitor :"+previous_routeselected+","+previous_destination+","+routeselected+","+destination)
    var rec = Monitor.findOne({route: routeselected, destination: destination})
    if (typeof rec === "undefined") {
        console.log("insert Monitor")
        Monitor.insert({route: routeselected, destination: destination, clicks: 1})
    } else {
        console.log("update Monitor")
        Monitor.update(rec._id, {$inc: { clicks: 1}})
    }
    if (previous_routeselected !== "0000") {
        console.log("update previous Monitor")
        var old = Monitor.findOne({route: previous_routeselected, destination: previous_destination})
        console.log("old clicks "+old.clicks)
        Monitor.update(old._id, {$inc: { clicks: -1}})
    }
}


function updateSelected() {
    var routeselected = Session.get('routeselected')
    var destination =  Session.get('destination')
    // console.log("updating updateCurrentState")
    Meteor.call('updateCurrentState', routeselected , destination , function(error, result) {
        if(error) console.log("error updateCurrentState : "+error);
        console.log("updating getLastUpdateTime")
        Meteor.call('getLastUpdateTime', function(error, result) {
            if(error) console.log("error getLastUpdateTime : "+error);
            console.log("updated result : "+result)
            Session.set('lastupdatetime', result)
            // console.log("updating markers")
            placeSelectedRouteMarkers()
        })
    });

}

Meteor.startup(function () {
    Session.set('routeselected', "0000")
    Session.set('destination', "0")
    Session.set('lastupdatetime', new Date())

    Meteor.call('areCollectionLoaded', function(error, loaded) {
        if (!loaded) {
            console.log("Collection are not loaded")
            loadCsvInDataBase("routes.txt", Routes)
            loadCsvInDataBase("stops.txt", Stops)
        } else {
            console.log("Collection are already loaded")
        }
    })
    
    var center = new google.maps.LatLng(48.10989306, -1.67887428);
    createMap(center);
});

var loadCsvInDataBase = function(csv, db) {
    var rec = db.find().count()
    if ( rec === 0 ) {
        d3.csv(csv, function(items) {
            for (var i = 0; i < items.length; i++) {
               db.insert(items[i])
            }
            console.log(csv + " traité : ", items.length)
        })
    } else {
        console.log("il y a deja " + rec + " enregistrements")
    }
}

function createMap(latLng) {
  var mapOptions = {
    streetViewControl: false,
    scrollwheel: false,
    zoom: 13,
    center: latLng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
}

function placeSelectedRouteMarkers() {
  deleteMarkers() 
  var routeselected = Session.get('routeselected')
  var directionsel = Session.get('destination')
  var image = 'img/'+routeselected+'.png'
  var s = Status.find({route: routeselected, direction: directionsel})
  s.forEach(function (status) {
    var stop = Stops.findOne({stop_id: status.stop})
    var latLng = new google.maps.LatLng(stop.stop_lat, stop.stop_lon)
    var stopMarker = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: image,
    });
    markerArray.push(stopMarker)
    stopMarker.setAnimation(google.maps.Animation.BOUNCE)
  });
}

function deleteMarkers() {
  if (markerArray) {
    for (i in markerArray){
      markerArray[i].setMap(null)
    }
  }
  markerArray.length = 0
}
