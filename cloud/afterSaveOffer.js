
Parse.Cloud.afterSave('Offer', function(request) {
    Parse.Cloud.useMasterKey();
    var object = request.object;
    if ( fieldIsValid(object.get('carrier')) && fieldIsValid(object.get('info')) && fieldIsValid(object.get('paymentPlan'))
        && fieldIsValid(object.get('owner')) && fieldIsValid(object.get('price')) && fieldIsValid(object.get('saving')) ) {
        request.object.get('owner').fetch({
            success: function(policy) {
                console.log("Offer owner found");
                policy.fetch({
                    success: function(updatedPolicy) {
                        var user = policy.get('owner');
                        var saving = object.get('saving');
                        var query = user.relation("notifications").query();
                        query.equalTo("offer", request.object);
                        query.equalTo("type", "Offer");
                        query.find({
                            success: function(results) {
                                if (results.length > 0) {
                                   console.log("User already had notification related to this offer")
                                } else {
                                    user.fetch({
                                        success: function(object) {
                                            var expert = user.get('expert');
                                            expert.fetch({
                                                success: function(object) {
                                                    var policyType = policy.get('type');
                                                    policyType.fetch({
                                                        success: function(updatedPolicyType) {
                                                            var Notification = Parse.Object.extend("Notification");
                                                            var notification = new Notification();
                                                            notification.set("type", "Offer");
                                                            notification.set("title", "Savings Opportunity");
                                                            notification.set("notificationMessage", "We found a be better policy for you! You could save up to $" + object.get('saving') + " in your " + policyType.get('title') + " policy!");
                                                            notification.set("offer", request.object);
                                                            notification.save(null, {
                                                                success: function(notification) {
                                                                    user.relation("notifications").add(notification);
                                                                    user.save(null, {
                                                                        success: function(user) {
                                                                            console.log("User updated with Offer notification!");
                                                                            sendNewOfferPushNotification(user);
                                                                        },
                                                                        error: function(user, error) {
                                                                            console.log("Failed to update user with new offer notification");
                                                                            console.log(error);
                                                                        }
                                                                    });
                                                                },
                                                                error: function(notification, error) {
                                                                    console.log("Failed to save offer notification")
                                                                }
                                                            });
                                                            sendNewOfferEmailNotification(user, expert, saving, policyType.get('title'));
                                                        },
                                                        error: function(error) {
                                                            console.log("Failed to fetch policy type");
                                                            console.log(error);
                                                        }
                                                    });
                                                },
                                                error: function(error) {
                                                    console.log("Failed to fetch existing user expert");
                                                    console.log(error);
                                                }
                                            });
                                        },
                                        error: function(error) {
                                            console.log("Failed to fetch existing user");
                                            console.log(error);
                                        }
                                    });
                                }
                            },
                            error: function(error) {
                                console.log("Error while searching notifications for user");
                            }
                        });
                    },
                    error: function(error) {
                        console.log("Failed to fetch policy");
                        console.log(error);
                    }
                });
            },
            error: function(error) {
               console.log("Offer owner not found");                           
            }
        });
    } else {
        console.log("Offer is NOT valid, please fill 'carrier', 'info', 'paymentPlan' and 'owner' fields!");
    }
})

function fieldIsValid(field) {
    if (field != undefined && field != null) {
        return true;
    } else {
        return false;
    }
}

function sendNewOfferPushNotification(user) {
    console.log("Enter sendNewOfferPushNotification")
    var message = "CoverPocket found a better policy for you! Check it out!"
 
    var pushQuery = new Parse.Query(Parse.Installation)
    pushQuery.equalTo('user', user)
 
    Parse.Push.send({
        where: pushQuery,
        data: {
            alert: message,
            sound: "default"
        }
    }, {
        success: function() {
            console.log("Push notification was successfully sent")
        },
        error: function(error) {
            console.log("Unable to send push notification" + error.message)
        }
    })
}

function sendNewOfferEmailNotification(user, expert, saving, insuranceType) {
    Parse.Cloud.useMasterKey();
    var userFirstName = user.get('firstName');
    var userEmail = user.get('email');
    var userLastName = user.get('lastName');
    var expertEmail = expert.get('email');
    var expertName = expert.get('name');

    MailerService.sendEmail({
        to: userEmail,
        from: "CoverPocket: " + expertName + " <" + expertEmail + ">",
        subject: "New savings opportunity",
        text: "Hi " + userFirstName + ",\n\nWe found a be better policy for you! You could save up to $" + saving + " in your " + insuranceType + " policy!\nIsn't it great having CoverPocket take care of your insurance so you can do more fun things?\n\nThanks,\n" + expertName
    }, {
        success: function(httpResponse) {
            console.log(httpResponse);
            response.success("Offer Email sent!");
        },
        error: function(httpResponse) {
            console.error(httpResponse);
            response.error("Error sending offer email");
        }
    });
}
