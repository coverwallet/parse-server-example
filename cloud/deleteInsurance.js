Parse.Cloud.afterDelete('Insurance', function(request) {
  var policy = request.object;
  var Quote = Parse.Object.extend("Quote");
  var queryQuotes = new Parse.Query(Quote);
  queryQuotes.equalTo("policy", policy);
  queryQuotes.find().then(function(quotes) {
    console.log("Will remove " + quotes.length + " quotes.");
    Parse.Object.destroyAll(quotes).then(function(success) {
      console.log("All insurance quotes were removed!");
    });
  });
  var ToDoTable = Parse.Object.extend("ToDoTable");
  var queryTodoTable = new Parse.Query(ToDoTable);
  queryTodoTable.equalTo("insurance", policy);
  queryTodoTable.find().then(function(todos) {
    console.log("Will remove " + todos.length + " todo-s.");
    Parse.Object.destroyAll(todos).then(function(success) {
      console.log("All todo-s for related insurance were removed!");
    });
  });
  if (policy.get('stats') != undefined && policy.get('stats') != null) {
    Parse.Object.destroyAll([policy.get('stats')]);
  }
  var Notification = Parse.Object.extend("Notification");
  var queryNotifications = new Parse.Query(Notification);
  queryNotifications.equalTo("insurance", policy);
  queryNotifications.find().then(function(notifications) {
    console.log("Will remove " + notifications.length + " offers.");
    Parse.Object.destroyAll(notifications).then(function(success) {
      console.log("All insurance notifications were removed!");
    });
  });
});

Parse.Cloud.beforeDelete('Insurance', function(request, response) {
  var policy = request.object;
  query = policy.relation("documents").query();
  query.find().then(function(documents) {
    console.log("Insurance documents found, need to remove: " + documents.length)
    Parse.Object.destroyAll(documents).then(function(success) {
      console.log("All insurance documents were removed!")
      var fieldsQuery = policy.relation("fields").query();
      fieldsQuery.find().then(function(fields) {
        console.log("Insurance fields found, need to remove: " + fields.length)
        Parse.Object.destroyAll(fields).then(function(success) {
          console.log("All insurance fields were removed!")
          var featuresQuery = policy.relation("keyFeatures").query();
          featuresQuery.find().then(function(features) {
            console.log("Insurance key features found, need to remove: " + features.length)
            Parse.Object.destroyAll(features).then(function(success) {
              console.log("All insurance features were removed!")
              var servicesQuery = policy.relation("services").query();
              servicesQuery.find().then(function(services) {
                console.log("Insurance services found, need to remove: " + services.length)
                Parse.Object.destroyAll(services).then(function(success) {
                  console.log("All insurance services were removed!")
                  response.success();
                }, function(error) {
                  response.error("Error while deleting insurance services.");
                })
              }, function(error) {
                response.error("Error while trying to find insurance services.");
              })
            }, function(error) {
              response.error("Error while deleting insurance features.");
            })
          }, function(error) {
            response.error("Error while trying to find insurance features.");
          })
        }, function(error) {
          response.error("Error while deleting insurance fields.");
        })
      }, function(error) {
        response.error("Error while trying to find insurance fields.");
      })
    }, function(error) {
      response.error("Error while deleting insurance documents.");
    })
  }, function(error) {
    response.error("Error while trying to find insurance documents.");
  })
});
