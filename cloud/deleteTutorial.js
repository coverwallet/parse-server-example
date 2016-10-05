
Parse.Cloud.beforeDelete('Tutorial', function(request, response) {
    var tutorial = request.object;
    query = tutorial.relation("examples").query();
    query.find().then(function(examples) {
        console.log("Tutorial examples found, need to remove: " + examples.length)
        Parse.Object.destroyAll(examples).then(function(success) {
            console.log("All tutorial examples were removed!")
            var InsuranceType = Parse.Object.extend("InsuranceType");
            var queryInsuranceType = new Parse.Query(InsuranceType);
            queryInsuranceType.equalTo("tutorial", tutorial);
            queryInsuranceType.find().then(function(types) {
                console.log("Will change " + types.length + " insurance types (tutorial field).")
                for	(index = 0; index < types.length; index++) {
                    types[index].unset('tutorial');
                }
                Parse.Object.saveAll(types, function(success) {
                    console.log("Insurance type tutorial fields changed successfully!");
                    response.success();
                }, function(error) {
                    response.error("Error while saving insurance type tutorial fields on deleting tutorial.");
                })
            }, function(error) {
                response.error("Error while trying to find insurance types on deleting tutorial.");
            })
        }, function(error) {
            response.error("Error while deleting tutorial examples.");
        })
    }, function(error) {
        response.error("Error while trying to find examples for tutorial.");
    })
});
