
Parse.Cloud.afterDelete('InsuranceType', function(request) {
    var type = request.object;
    if (type.get('tutorial') != undefined && type.get('tutorial') != null) {
        Parse.Object.destroyAll([type.get('tutorial')]);
    }
});

Parse.Cloud.beforeDelete('InsuranceType', function(request, response) {
    var type = request.object;
    query = type.relation("insuranceFields").query();
    query.find().then(function(insuranceFields) {
        console.log("Insurance type fields found, need to remove: " + insuranceFields.length)
        Parse.Object.destroyAll(insuranceFields).then(function(success) {
            console.log("All insurance type fields were removed!")
            var Insurance = Parse.Object.extend("Insurance");
            var queryPolicies = new Parse.Query(Insurance);
            queryPolicies.equalTo("type", type);
            queryPolicies.find().then(function(policies) {
                console.log("Will change " + policies.length + " policies (type field).")
                for	(index = 0; index < policies.length; index++) {
                    policies[index].unset('type');
                }
                Parse.Object.saveAll(policies, function(success) {
                    console.log("Policies changed successfully!");
                    var SearchInsurance = Parse.Object.extend("SearchInsurance");
                    var querySearchOptions = new Parse.Query(SearchInsurance);
                    querySearchOptions.equalTo("type", type);
                    querySearchOptions.find().then(function(options) {
                        console.log("Will change " + options.length + " search options (type field).")
                        for	(index = 0; index < options.length; index++) {
                            options[index].unset('type');
                        }
                        Parse.Object.saveAll(options, function(success) {
                            console.log("Insurance search options changed successfully!");
                            response.success();
                        }, function(error) {
                            response.error("Error while saving insurance search options on deleting insurance type.");
                        })
                    }, function(error) {
                        response.error("Error while trying to find insurance search options on deleting insurance type.");
                    })
                }, function(error) {
                     response.error("Error while saving insurances (type filed) on deleting insurance type.");
                })
            }, function(error) {
                response.error("Error while trying to find insurances (type filed) on deleting insurance type.");
            })
        }, function(error) {
            response.error("Error while deleting insurance type fields.");
        })
    }, function(error) {
        response.error("Error while trying to find insurance type fileds.");
    })
});
