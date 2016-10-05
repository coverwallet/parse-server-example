
Parse.Cloud.beforeDelete('Offer', function(request, response) {
    var offer = request.object;
    query = offer.relation("keyFeatures").query();
    query.find().then(function(features) {
        console.log("Offer features found, need to remove: " + features.length)
        Parse.Object.destroyAll(features).then(function(success) {
            console.log("All features were removed!")
            response.success();
        }, function(error) {
            response.error("Error while deleting offer features.");
        })
    }, function(error) {
        response.error("Error while trying to find offer key features.");
    })
});
