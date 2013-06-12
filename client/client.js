Template.lines.routes = function () {
    var r = Routes.find({}, {sort: {route_id : 1}});
    return r;
};

Meteor.startup(function () {

    Meteor.call('areCollectionLoaded', function(error, loaded) {
        if (!loaded) {
            console.log("Collection are not loaded")
            loadCsvInDataBase("routes.txt", Routes)
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

