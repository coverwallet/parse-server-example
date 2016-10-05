module.exports = {
    initialize: function() {
        return this;
    },
    version: '1.0.0'
}

const COVERPOCKET_STAGING_APP_ID = 'ui0cbQ6aU1WbRnNFdv9JvhXTbe8d5vFq0nNy7RL4';
const COVERPOCKET_PRODUCTION_APP_ID = '630SWpQQxBXkXfGqYb0OOCOxUPRHgE8MyXeOyfnr';

// Facebook setup
if (Parse.applicationId === COVERPOCKET_STAGING_APP_ID) {
    module.exports.environment = 'staging';
    module.exports.FBAPPID = '563461203819196';
    module.exports.FBAPPSECRET = '0390ba6901d544fa02e32e72a443e349';
    module.exports.INTERNAL_RECIPIENT_EMAILS = "test.coverpocket@coverpocket.com";
} else if (Parse.applicationId === COVERPOCKET_PRODUCTION_APP_ID) {
    module.exports.environment = 'production';
    module.exports.FBAPPID = '557231984442118';
    module.exports.FBAPPSECRET = '2f4ad23d90ede0e098c3694c9b784b9c';
    module.exports.INTERNAL_RECIPIENT_EMAILS = "alerts.coverpocket@coverpocket.com";
}
