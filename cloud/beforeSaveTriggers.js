
// Check if Stats Object is added to insurance
// Validate currentStatus field

var enabledInsuranceStatuses = ["FileUploaded", "Ready", "EmailSent", "MissingInfo", "UpdatedByUser"];

Parse.Cloud.beforeSave('Insurance', function(request, response) {
    var type = request.object.get('currentStatus');
    var goNext = true;
    if (type != undefined) {
        if (arrayContainsValue(enabledInsuranceStatuses, type) == false) {
            response.error(composeAvailableValuesFromArray(enabledInsuranceStatuses));
            goNext = false;
        }
    }
    if (goNext) {
        var stats = request.object.get('stats');
        if (stats == null) {
            var Stats = Parse.Object.extend("InsuranceStats");
            var stats = new Stats();
            var numberOfClaims = 0;
            var valueOfClaims = 0;
            stats.set("numberOfFiledClaims", numberOfClaims);
            stats.set("valueOfClaims", valueOfClaims);
            stats.save(null, {
                success: function(stats) {
                    request.object.set("stats", stats);
                    response.success();
                },
                error: function(stats, error) {
                    console.log('Failed to create new object, with error code: ' + error.message);
                    response.success();
                }
            })
        } else {
            response.success();
        }
    }
});


// Validaiton fields part:
// General

function arrayContainsValue(array, value) {
    if (array.indexOf(value) != -1) {
        return true;
    } else {
        return false;
    }
}

function composeAvailableValuesFromArray(array) {
    var result = "Available values: ";
    for	(index = 0; index < array.length; index++) {
        result = result.concat("'").concat(array[index]).concat("' ");
    }
    result.concat(".");
    return result;
}


// This function validates InsuranceFeature type filed
var featureTypes = ["Negative", "Neutral", "Positive", "General"];

Parse.Cloud.beforeSave('InsuranceFeature', function(request, response) {
    var type = request.object.get('type');
    if (type == undefined) {
        response.success();
    } else {
        if (arrayContainsValue(featureTypes, type)) {
            response.success();
        } else {
            response.error(composeAvailableValuesFromArray(featureTypes));
        }
    }
});


// This function validates Notification type field
var notificationTypes = ["WelcomeMessage", "AgentMessage", "Offer", "UploadPolicy", "Unknown", "Stats", "PolicyReady", "PolicyMissingInfo", "Reminder"];

Parse.Cloud.beforeSave('Notification', function(request, response) {
    var type = request.object.get('type');
    if (type == undefined) {
        response.success();
    } else {
        if (arrayContainsValue(notificationTypes, type)) {
            response.success();
        } else {
            response.error(composeAvailableValuesFromArray(notificationTypes));
        }
    }
});

// This function validates DocumentType type field
var docTypes = ["policy","bill","claim","other"];

Parse.Cloud.beforeSave('DocumentType', function(request, response) {
  var type = request.object.get('typeId');
  if (type == undefined) {
    response.error("Field 'typeId' must be filled in");
  } else {
    if (arrayContainsValue(docTypes, type)) {
        response.success();
    } else {
        response.error(composeAvailableValuesFromArray(docTypes));
    }
  }
});

// This function validates reminder periodicity
var periodicities = ["Every Month", "Every 6 Months", "Every Year", "One-Off"];
Parse.Cloud.beforeSave('InsuranceService', function(request, response) {
  var periodicity = request.object.get('periodicity');
  if (periodicity == undefined) {
    response.error("Field 'periodicity' must be filled in");
  } else {
    if (arrayContainsValue(periodicities, periodicity)) {
        response.success();
    } else {
        response.error(composeAvailableValuesFromArray(periodicities));
    }
  }
});
