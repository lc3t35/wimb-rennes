var heure;

Meteor.methods({

  updateCurrentState: function(route, direction) {
    return getCurrentState(route, direction)
  },
               
  getLastUpdateTime: function() {
    return heure;
  },
  
  areCollectionLoaded: function() {
    var stop = Stops.find({})
    var route = Routes.find({})
    if ((typeof stop === "undefined") && (typeof route === "undefined")) return false
    
    if ((stop.count() !== 0) && (route.count() !== 0)) {
        return true;
    } else {
        return false;
    }
  }
});

var getCurrentState = function(route, direction) {
  console.log("Updating " + (new Date()).toLocaleString())
  console.log("route : " + route + ", direction : " + direction)
  var url = "http://data.keolis-rennes.com/json/?cmd=getbusnextdepartures&version=2.1&key="+token+"&param[mode]=line&param[route]="+route+"&param[direction]="+direction
  var h = Meteor.http.call("GET",url)
  if (h.content) {
    var s = JSON.parse(h.content)
    var answer = s.opendata.answer
    var code = answer.status["@attributes"].code
    var message = answer.status["@attributes"].message
    console.log("Status code " + code +", message : " + message)
    heure = answer.data["@attributes"].localdatetime
    console.log("Localdatetime " + heure)
    var stoplines = answer.data.stopline
    if (typeof stoplines !== "undefined") {
        for (var i = 0; i < stoplines.length; i++) {
          var stopstatus = stoplines[i]
          var status = Status.findOne({ route: route, stop: stopstatus.stop , direction: direction })
          var tt = stopstatus.departures.departure
          var t=tt.content
          var temps = new Array()
          if (t) {
              temps.push({ temps: computeTemps(t), accurate: access_accurate(tt) , headsign: access_headsign(tt)})
          } else {
              for (var j = 0; j < tt.length; j++) {
                 temps.push({ temps: computeTemps(tt[j].content), accurate: access_accurate(tt[j]), headsign: access_headsign(tt[j]) })
              }
          }
          if(!status) {
            // console.log("insert " + stopstatus.stop + " direction=" + direction)
            Status.insert({ route: route, stop: stopstatus.stop, direction: stopstatus.direction, temps: temps });
          } else {
            // console.log("update " + stopstatus.stop + " direction=" + direction)
            Status.update(status, { route: route, stop: stopstatus.stop, direction: stopstatus.direction, temps: temps });
          }
        }
        console.log("nb status traites : " + stoplines.length)
        console.log("nb valeurs en base : " + Status.find({route: route}).count());
        console.log("nb total de valeurs en base : " + Status.find().count());
    } else {
        console.log("pas de stopline pour cette ligne")
    }
  } else {
    console.log("requete http vide")
  }
}

function access_accurate(context) {
    return context["@attributes"].accurate
}

function access_headsign(context) {
    return context["@attributes"].headsign
}

function computeTemps(DateOne) {
    var oDateOne = new Date(DateOne)
    var oDateTwo = new Date(heure)
    return (oDateOne.getTime() - oDateTwo.getTime()) / 1000
}
