
Parse.Cloud.beforeDelete('Carrier', function(request, response) {
    var carrier = request.object;
    query = carrier.relation("contacts").query();
    query.find().then(function(contacts) {
        console.log("Carrier contacts found, need to remove: " + contacts.length)
        Parse.Object.destroyAll(contacts).then(function(success) {
            console.log("All carrier contacts were removed!")
            response.success();
        }, function(error) {
            response.error("Error while deleting carrier contacts.");
        })
    }, function(error) {
        response.error("Error while trying to find carrier contacts.");
    })
});
