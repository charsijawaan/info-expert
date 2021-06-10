var express = require('express');
var router = express.Router();

var { google } = require("googleapis");

const googleConfig = {
    clientId: process.env.GOOGLE_OAUTH_ID,
    clientSecret: process.env.GOGOLE_OAUTH_SECRET,
    redirect: 'https://info-expert.herokuapp.com/google_callback',
}

const defaultScope = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/contacts', 
];

function getConnectionUrl(auth) {
    return auth.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: defaultScope
    });
}

function urlGoogle() {
    const auth = createConnection();
    const url = getConnectionUrl(auth);
    return url;
}

function createConnection() {
    return new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirect
    );
}

router.get('/', function(req, res, next) {
  let params = {
    active: { home: true },
    googleUrl: urlGoogle(),
  };

  res.render('index', params);
});

module.exports = router;