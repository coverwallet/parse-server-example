module.exports = {
    sendEmail: function(props, callback) {

        var Constants = require('./cloud/constants.js');
        if (Constants.environment === 'staging') {
            props.subject = '[STAGING] ' + props.subject;
        }

        var Mailgun = require('mailgun');
        Mailgun.initialize('coverpocket.com', 'key-5c6c109bb4ccfced1a93102fded8c45b');
        Mailgun.sendEmail(props, callback);
    }
}
