// Use the web-push library to hide the implementation details of the communication
// between the application server and the push service.
// For details, see https://tools.ietf.org/html/draft-ietf-webpush-protocol and
// https://tools.ietf.org/html/draft-ietf-webpush-encryption.
var webPush = require('web-push');

webPush.setGCMAPIKey(process.env.GCM_API_KEY);

module.exports = function(app, route) {
  app.post(route + 'register', function(req, res) {
    // A real world application would store the subscription info.
    res.sendStatus(201);
  });

  // Send N notifications, specifying whether the service worker will need to show
  // a visible notification or not using the push payload:
  // - 'true': show a notification;
  // - 'false': don't show a notification.
  app.post(route + 'sendNotification', function(req, res) {
    var num = 1;

    var promises = [];

    var intervalID = setInterval(function() {
      promises.push(webPush.sendNotification(req.body.endpoint, {
        TTL: 200,
        payload: JSON.stringify(req.body.visible),
        userPublicKey: req.body.key,
        userAuth: req.body.authSecret,
      }));

      if (num++ === Number(req.body.num)) {
        clearInterval(intervalID);

        Promise.all(promises)
        .then(function() {
          res.sendStatus(201);
        });
      }
    }, 1000);
  });
};
