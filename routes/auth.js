const router = require("express-promise-router")();
const graph = require("../graph");
var MSEmail = require("../models/msEmail");
var MSContact = require("../models/msContact");


router.get("/signin", async function (req, res) {
  const urlParameters = {
    scopes: process.env.OAUTH_SCOPES.split(","),
    redirectUri: process.env.OAUTH_REDIRECT_URI,
  };

  try {
    const authUrl = await req.app.locals.msalClient.getAuthCodeUrl(
      urlParameters
    );
    res.redirect(authUrl);
  }
  catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/callback", async function (req, res) {
  const tokenRequest = {
    code: req.query.code,
    scopes: process.env.OAUTH_SCOPES.split(","),
    redirectUri: process.env.OAUTH_REDIRECT_URI,
  };

  try {
    const response = await req.app.locals.msalClient.acquireTokenByCode(
      tokenRequest
    );

    req.session.userId = response.account.homeAccountId;

    // const user = await graph.getUserDetails(response.accessToken);
    const contacts = await graph.getUserContacts(response.accessToken);
	  const emails = await graph.getUserEmails(response.accessToken);

    saveContactsToDatabase(contacts.value);
    saveEmailsToDatabase(emails.value);
	
  }
  catch (error) {
	  console.log(error);
  }

  res.redirect("/home");
});

async function saveEmailsToDatabase(emails) {

  // var MSEmailSchema = new Schema({}, { strict: false, id: false });
  // var MSEmail = mongoose.model('MSEmail', MSEmailSchema);
    
  for(var i = 0; i < emails.length; i++) {
    let emailExists = await MSEmail.exists({id: emails[i].id});
    if(!emailExists) {
      var data = new MSEmail(emails[i]);
      await data.save({ checkKeys: false });
    }    
  }

}

async function saveContactsToDatabase(contacts) {
  // var MSContactSchema = new Schema({}, { strict: false, id: false });
  // var MSContact = mongoose.model('MSContact', MSContactSchema);

  for(var i = 0; i < contacts.length; i++) {
    let contactExists = await MSContact.exists({id: contacts[i].id});
    if(!contactExists) {
      var data = new MSContact(contacts[i]);
      await data.save({ checkKeys: false });
    }    
  }
}

module.exports = router;
