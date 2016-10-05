var expertArray = new Array();
var serviceArray = new Array();

Parse.Cloud.job("reminderJob", function(request, status) {
  Parse.Cloud.useMasterKey();
  console.log("Run reminder job")
  var query = new Parse.Query('Contact');
  query.limit(1000);
  query.find().then(function(results) {
    expertArray = expertArray.concat(results);
    getAllServices(0, status);
  })
});

function getAllServices(loopCount, status) {
  console.log("Get all services")
  var limit = 1000;
  var query = new Parse.Query('InsuranceService');
  query.include('user');
  query.limit(limit);
  query.skip(limit * loopCount);
  query.find({
    success: function(results) {
      if (results.length > 0) {
        serviceArray = serviceArray.concat(results);
        loopCount++;
        getAllServices(loopCount, status);
      } else {
        remindAllUsers(serviceArray)
        status.success("Reminder job was successfully completed");
      }
    },
    error: function(error) {
      status.error("Error: " + error.code + " " + error.message);
    }
  });
}

function remindAllUsers(services) {
  console.log("remind all users")
  for (var i = 0; i < services.length; i++) {
    var nextService = services[i];
    if (isNeedToRemind(nextService)) {
      sendNotificationToUser(nextService);
      sendRemindEmailToUser(nextService);
    }
  }
}

function isNeedToRemind(service) {
  console.log("is need to remind")
  var isNeedToRemind = false
  var moment = require('cloud/moment');
  var now = moment()
  var dueDate = moment(service.get('dueDate'))
  if (service.get('isUsed')) {
    switch (service.get('periodicity')) {
      case 'Every Month':
        console.log("month: ".dueDate.date())
        isNeedToRemind = now.date() == dueDate.date() ? true : false;
        break;
      case 'Every 6 Months':
        var dayDiff = now.date() == dueDate.date() ? true : false;
        if (dayDiff) {
          var duration = moment.duration(now.diff(dueDate));
          var months = Math.abs(Math.ceil(duration.asMonths()));
          isNeedToRemind = months == 6 ? true : false
        }
        break;
      case 'Every Year':
        var dayDiff = now.date() == dueDate.date() ? true : false;
        var monthDiff = now.month() == dueDate.month() ? true : false;
        isNeedToRemind = dayDiff & monthDiff;
        break;
      case 'One-Off':
        var dateDiff = moment(dueDate).isSame(now, 'day');
        if (dateDiff) {
          service.destroy({});
        }
        isNeedToRemind = dateDiff;
        break;
    }
  }
  return isNeedToRemind;
}

function sendNotificationToUser(service) {
  var user = service.get('user')
  if (user == undefined) {
    console.log("User is undefined");
    return
  }
  var message = service.get('serviceDescription')
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
      console.log("Push notification was successfully sent.")
    },
    error: function(error) {
      console.log("Unable to send push notification " + error.message)
    }
  })
}

function sendRemindEmailToUser(service) {
  console.log("send remind email")
  var user = service.get('user')
  if (user == undefined) {
    console.log("User is undefined");
    return
  }
  Parse.Cloud.useMasterKey();

  for (var i = 0; i < expertArray.length; i++) {
    if (expertArray[i].id == user.get('expert').id) {
      var fromExpertEmail = expertArray[i].get('email')
      if (fromExpertEmail != null) {
        MailerService.sendEmail({
          to: user.get('email'),
          from: fromExpertEmail,
          subject: "Reminder - CoverPocket",
          text: service.get('serviceDescription')
        });
      } else {
        console.log("Email is undefined")
      }
    }
  }
}
