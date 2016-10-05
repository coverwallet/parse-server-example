
Parse.Cloud.beforeDelete('Contact', function(request, response) {
    var contact = request.object;
    var User = Parse.Object.extend("User");
    var queryUsers = new Parse.Query(User);
    queryUsers.equalTo("expert", contact);
    queryUsers.find().then(function(users) {
        console.log("Will change " + users.length + " users (expert field).")
        for	(index = 0; index < users.length; index++) {
            users[index].unset('expert');
        }
        Parse.Cloud.useMasterKey();
        Parse.Object.saveAll(users, function(success) {
            console.log("Users expert field changed successfully!");
            response.success();
        }, function(error) {
            response.error("Error while deleting contact from users expert field.");
        })
    }, function(error) {
        response.error("Error while deleting contact from users expert field.");
    })
});
