Meteor.methods({
  
  areCollectionLoaded: function() {
    var route = Routes.find({})
    if (typeof route === "undefined") return false
    
    if (route.count() !== 0) {
        return true;
    } else {
        return false;
    }
  }
});
