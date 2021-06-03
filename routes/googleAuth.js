var express = require('express');
var router = express.Router();
var { google } = require("googleapis");
var atob = require('atob');
const { json } = require("express");

var GoogleEmail = require("../models/googleEmail");
var GoogleContact = require("../models/googleContact");

function getGooglePlusApi(auth) {
    return google.plus({ version: 'v1', auth });
}

const googleConfig = {
    clientId: process.env.GOOGLE_OAUTH_ID,
    clientSecret: process.env.GOGOLE_OAUTH_SECRET,
    redirect: 'http://localhost:3000/google_callback',
}

function createConnection() {
    return new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirect
    );
}

function getDecodedMail(encodedEmail) {
    var decodedEmail = {
        id: encodedEmail.id,
        snippet: encodedEmail.snippet,
        data: atob(encodedEmail.raw),
        internalDate: encodedEmail.internalDate,
    }
    return decodedEmail;
}

function getFirst500Messages(auth, query) {
    return new Promise(async (resolve, reject) => {    

        var today = new Date();
        today.setMonth(today.getMonth() - 2);
    
        var afterDate = today.getFullYear() + '/'
        + ('0' + (today.getMonth()+1)).slice(-2) + '/'
        + ('0' + today.getDate()).slice(-2)

        const gmail = google.gmail({version: 'v1', auth});

        gmail.users.messages.list( { userId: 'me', maxResults: 500, q: "in:inbox after:" + afterDate }, (err, res) => {
            if(err) {
                console.log(err);
            }

            var msgs = res.data.messages;

            if(msgs.length) {
                msgs.forEach( async (m) => {
                    try {
                        gmail.users.messages.get({ userId: 'me', id: m.id, format: 'raw' }, async (err, res) => {
                            if(err) {
                                console.log(err);
                            }
                            
                            decodedEmail = getDecodedMail(res.data);
                            
                            var emailExists = await GoogleEmail.exists({id: decodedEmail.id});
                            if(!emailExists) {
                                var data = new GoogleEmail(decodedEmail);
                                await data.save({ checkKeys: false });
                            }                            
                        })
                    }
                    catch(err) {
                        
                    }                    
                })
            }
          }    
        );  
      })
    ;
}

function getContacts(auth) {
    var contacts = google.people({version: 'v1', auth});
    contacts.people.connections.list({resourceName: "people/me", personFields: "names,phoneNumbers"}, (err, res) => {
        if(err) {
            console.log(err)
        }
        var connections = res.data.connections;
        if(connections.length) {
            connections.forEach((c) => {
                try {
                    contacts.people.get({resourceName: c.resourceName, personFields: "names,phoneNumbers"}, async (err, res) => {
                        if(err) {
                            console.log(err);
                        }

                        var contact = res.data;

                        var contactExists = await GoogleContact.exists({resourceName: contact.resourceName})
                        if(!contactExists) {
                            var data = new GoogleContact(contact);
                            await data.save({ checkKeys: false });
                        }
                    })
                }
                catch(err) {

                }            
            })
        }
    })
}


router.get("/", async (req, res) => {
    code = req.query.code;
    var auth = createConnection();
    const data = await auth.getToken(code);
    const tokens = data.tokens;
    
    auth.setCredentials(tokens);

    getFirst500Messages(auth);
    getContacts(auth);

    res.redirect("/home");
})


module.exports = router;