
Parse.Cloud.afterDelete(Parse.User, function(request) {
    Parse.Cloud.useMasterKey();
    var user = request.object
	var Insurance = Parse.Object.extend("Insurance")
	var queryPolicies = new Parse.Query(Insurance)
	queryPolicies.equalTo("owner", user)
	queryPolicies.find().then(function(policies) {
        Parse.Object.destroyAll(policies).then(function(success) {
            console.log("All policies were removed!");
            var queryInstallations = new Parse.Query(Parse.Installation);
            queryInstallations.equalTo("user", request.object);
            queryInstallations.find().then(function(installations) {
                console.log("Found installations count: " + installations.length);
                Parse.Object.destroyAll(installations).then(function(success) {
                    console.log("All installations were removed!")
                })
            });
        })
	})

    var queryQuotes = new Parse.Query(Quote)
    queryQuotes.equalTo("owner", user)
    queryQuotes.find().then(function(quotes) {
        console.log("Will remove " + quotes.length + " quotes.");
        Parse.Object.destroyAll(quotes).then(function(success) {
            console.log("All quotes were removed!");
        })
    })
    
    var ToDoTable = Parse.Object.extend("ToDoTable");
    var queryTodoTable = new Parse.Query(ToDoTable);
    queryTodoTable.equalTo("user", user);
    queryTodoTable.find().then(function(todos) {
        console.log("Will remove " + todos.length + " todo-s.");
        Parse.Object.destroyAll(todos).then(function(success) {
            console.log("All todo-s for related user were removed!");
        });
    });
});

Parse.Cloud.beforeDelete(Parse.User, function(request, response) {
    var user = request.object;
    query = user.relation("notifications").query();
    query.find().then(function(notifications) {
        console.log("Notifications found, need to remove: " + notifications.length)
        Parse.Object.destroyAll(notifications).then(function(success) {
            console.log("All notifications were removed!")
            var searchOptionsQuery = user.relation("searchOptions").query();
            searchOptionsQuery.find().then(function(options) {
                console.log("User search options found, need to remove: " + options.length)
                Parse.Object.destroyAll(options).then(function(success) {
                    console.log("All user search options were removed!")
                    response.success();
                }, function(error) {
                    response.error("Error while deleting user search options.");
                })
            }, function(error) {
                response.error("Error while trying to find user search options.");
            })
        }, function(error) {
            response.error("Error while deleting user notifications.");
        })
    },function(error) {
        response.error("Error while trying to find user notifications.");
    })
});
