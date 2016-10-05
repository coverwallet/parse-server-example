
Parse.Cloud.beforeDelete('PaymentPlan', function(request, response) {
    var plan = request.object;
    var Offer = Parse.Object.extend("Offer");
    var queryOffer = new Parse.Query(Offer);
    queryOffer.equalTo("paymentPlan", plan);
    queryOffer.find().then(function(offers) {
        console.log("Will change " + offers.length + " offers (paymentPlan field).")
        for	(index = 0; index < offers.length; index++) {
            offers[index].unset('paymentPlan');
        }
        Parse.Object.saveAll(offers, function(success) {
            console.log("Offers paymentPlan fields changed successfully!");
            response.success();
        }, function(error) {
            response.error("Error while saving offers paymentPlan fields on deleting payment plan.");
        })
    }, function(error) {
        response.error("Error while trying to find offers on deleting payment plan.");
    })
});
