require('cloud/deleteUser.js');
require('cloud/deleteInsurance.js');
require('cloud/deleteCarrier.js');
require('cloud/deleteContact.js');
require('cloud/deleteQuote.js');
require('cloud/deleteTutorial.js');
require('cloud/deletePaymentPlan.js');
require('cloud/deleteInsuranceType.js');
require('cloud/reminderJob.js');
require('cloud/beforeSaveTriggers.js');
require('cloud/afterSaveOffer.js');

var Constants = require('cloud/constants.js');
var MailerService = require('cloud/mailerService.js');

Parse.Cloud.define("SendEmail", function(request, response) {
  Parse.Cloud.useMasterKey();

  console.log(request.params.bcc)

  var params = {
    to: request.params.recipient,
    from: request.params.sender_name + " <" + request.params.sender_email + ">",
    subject: request.params.email_subject,
    text: request.params.email_content
  }

  if (request.params.bcc != null) {    
    console.log(request.params.bcc)
    params["bcc"] = request.params.bcc
  }
  console.log(params)

  // Send email to users expert
  MailerService.sendEmail(params, {
    success: function(httpResponse) {
      response.success("SendEmail: Email sent!");
    },
    error: function(httpResponse) {
      console.error(httpResponse);
      response.error("SendEmail: Failed to send email");
    }
  });
});

//Not used from version 1.11
Parse.Cloud.define("SendEmailAfterToDoTableWasAdded", function(request, response) {
  Parse.Cloud.useMasterKey();

  // Send email to users expert
  MailerService.sendEmail({
    to: request.params.expert_email + "," + Constants.INTERNAL_RECIPIENT_EMAILS,
    from: "Rashmi M. <rashmi.m@coverpocket.com>",
    subject: request.params.email_subject,
    text: request.params.email_content
  }, {
    success: function(httpResponse) {
      response.success("SendEmailAfterToDoTableWasAdded: Email sent!");
    },
    error: function(httpResponse) {
      console.error(httpResponse);
      response.error("SendEmailAfterToDoTableWasAdded: Failed to send email");
    }
  });
});

//Not used from version 1.11
Parse.Cloud.define("SendWelcomeEmailNotification", function(request, response) {
  Parse.Cloud.useMasterKey();
  var Contact = Parse.Object.extend("Contact");
  var query = new Parse.Query(Contact);
  query.equalTo("defaultExpert", true);
  query.find().then(function(contacts) {
    console.log("Found " + contacts.length + " default experts");
    if (contacts.length > 0) {
      var expert = contacts[0];

      MailerService.sendEmail({
        to: request.params.user_email,
        from: "CoverPocket: " + expert.get('name') + " <" + expert.get('email') + ">",
        subject: "Welcome to CoverPocket",
        text: "Hi "+request.params.user_fname+",\n\nWelcome to CoverPocket, we’re excited to have you aboard! Signing up with us means you never have to worry about your insurance again. CoverPocket helps you:\n\n\t1. Safely and intuitively organize all of your insurance information in one place\n\t2. Automatically look for better rates so that you can get the best policy at the best price\n\t3. 24/7 expert advice, so you can understand your insurance and get the answers you need\n\nLet us know if you have any questions in the meantime. We look forward to working with you! \n\nCheers,\nThe CoverPocket Team"
      }, {
        success: function(httpResponse) {
          response.success("SendWelcomeEmailNotification: Email sent!");
        },
        error: function(httpResponse) {
          console.error(httpResponse);
          response.error("SendWelcomeEmailNotification: Failed to send email");
        }
      });
    } else {
      console.log("No default experts found");
      response.error("No default experts found to send welcome email");
    }
  });
});

//Not used from version 1.11
Parse.Cloud.define("SendPolicyUploadedEmailNotification", function(request, response) {
  Parse.Cloud.useMasterKey();

  var referral_link = request.params.referral_link
  var ps = ""
  if (referral_link !== undefined) {
    ps = "\n\nPS: When you love something, you should let the whole world know. Love using CoverPocket? Share us with your friends and If they download the app and upload a policy, you’ll get handsomely rewarded.\n"+referral_link
  }

  MailerService.sendEmail({
    to: request.params.user_email,
    from: "CoverPocket: " + request.params.expert_name + " <" + request.params.expert_email + ">",
    subject: "Your policy has been uploaded",
    text: "Hi " + request.params.user_fname + ",\n\nSuccess! Your policy has been uploaded. Right now, it’s in the hands of our experts, but it will be added to your CoverPocket digital wallet soon.\n\nFrom there? We’ll start looking for ways to help you save money. Easy, right?\n\nLet us know if you have any questions.\n\nCheers,\nThe CoverPocket Team"+ps
  }, {
    success: function(httpResponse) {
      response.success("SendWelcomeEmailNotification: Email sent!");
    },
    error: function(httpResponse) {
      console.error(httpResponse);
      response.error("SendWelcomeEmailNotification: Failed to send email");
    }
  });
});

Parse.Cloud.define("SendPolicyUploadedPushNotification", function(request, response) {
  var insuranceId = request.params.insurance_id;
  var Insurance = Parse.Object.extend("Insurance");
  var policyQuery = new Parse.Query(Insurance);
  policyQuery.equalTo("objectId", insuranceId);
  policyQuery.include("owner");
  policyQuery.include("type");
  policyQuery.first({
    success: function(insurance) {
      console.log("Found insurance in SendPolicyUploadedPushNotification");
      var user = insurance.get('owner');
      var policyType = insurance.get('type');
      var policyTypeTitle = policyType.get('title');
      var Notification = Parse.Object.extend("Notification");
      var notification = new Notification();
      notification.set("type", "UploadPolicy");
      notification.set("insurance", insurance);
      notification.set("insuranceType", policyType);
      notification.set("title", policyTypeTitle + " Policy Uploaded");
      notification.set("notificationMessage", "Great! Your "+ policyTypeTitle.toLowerCase() +" insurance policy has been successfully uploaded. Our experts are reviewing it now and will update your profile shortly.");
      notification.save(null, {
        success: function(notification) {
          user.relation("notifications").add(notification);
          user.save(null, {
            success: function(user) {
              console.log("User Updated!");
              SendPolicyUploadedPushNotificationToUser(user);
              response.success("Notification created in SendPolicyUploadedPushNotification");
            },
            error: function(user, error) {
              console.log("Failed to update user with new notification");
              console.log(error);
              response.error("Failed to update user with new notification in SendPolicyUploadedPushNotification function");
            }
          });
        },
        error: function(notification, error) {
          console.log("Failed to save notification in SendPolicyUploadedPushNotification");
          console.log(error);
          response.error("Failed to save notification in SendPolicyUploadedPushNotification function");
        }
      });
    },
    error: function(error) {
      console.log("Did not found insurance by its objectId in SendPolicyUploadedPushNotification function");
      console.log(error);
      response.error("Did not found insurance by its objectId in SendPolicyUploadedPushNotification function");
    }
  });
});

function SendPolicyUploadedPushNotificationToUser(user) {
  console.log("Enter SendPolicyUploadedPushNotificationToUser");
  var message = "Policy uploaded";
  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.equalTo('user', user);
  Parse.Push.send({
    where: pushQuery,
    data: {
      alert: message,
      sound: "default"
    }
  }, {
    success: function() {
      console.log("Push notification was successfully sent from SendPolicyUploadedPushNotificationToUser");
    },
    error: function(error) {
      console.log("Unable to send push notification from SendPolicyUploadedPushNotificationToUser");
      console.log(error);
    }
  });
};

//Not used from version 1.11
Parse.Cloud.define("SendEmailAfterUserSignup", function(request, response) {
  Parse.Cloud.useMasterKey();

  MailerService.sendEmail({
    to:  Constants.INTERNAL_RECIPIENT_EMAILS,
    from: "Rashmi M. <rashmi.m@coverpocket.com>",
    subject: request.params.email_subject,
    text: request.params.email_content
  }, {
    success: function(httpResponse) {
      response.success("SendEmailAfterUserSignup: Email sent!");
    },
    error: function(httpResponse) {
      console.error(httpResponse);
      response.error("SendEmailAfterUserSignup: Failed to send email");
    }
  });
});

Parse.Cloud.define("checkExistingFacebookUser", function(request, response) {
    Parse.Cloud.useMasterKey();

    var token = request.params.token;
    var facebookId = request.params.facebookId;

    Parse.Cloud.httpRequest({
        url: 'https://graph.facebook.com/debug_token?input_token='+token+'&access_token='+Constants.FBAPPID+'|'+Constants.FBAPPSECRET
    }).then(function(httpResponse) {
        // success

        var jsonResponse = JSON.parse(httpResponse.text);
        var valid = jsonResponse.data.is_valid;

        if (valid == "1") {
            var query = new Parse.Query(Parse.User);
            query.equalTo("facebookID", facebookId);
            query.first({
              success: function(user) {
                if (!user) {
                  response.success(null)
                } else {
                  response.success(user.getSessionToken());
                }
              },
              error: function(error) {
                response.error(error);
              },
              useMasterKey: true
            });
        } else {
            response.error("Invalid Facebook Token: ".token);
        }
    },function(httpResponse) {
        // error
        response.error(httpResponse.text);
    });
});