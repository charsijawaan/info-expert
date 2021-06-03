var graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

module.exports = {
  getUserDetails: async function(accessToken) {
    const client = getAuthenticatedClient(accessToken);

    const user = await client
      .api('/me')
      .select('displayName')      
      .get();
    return user;
  },

  getUserContacts: async function(accessToken) {
    const client = getAuthenticatedClient(accessToken);

    const contacts = await client
      .api('/me/contacts')
      .top('1000')
      .get();
    return contacts;
  },

  getUserEmails: async function(accessToken) {
    const client = getAuthenticatedClient(accessToken);
    
    var today = new Date();
    today.setMonth(today.getMonth() - 2);

    var afterDate = today.getFullYear() + '-'
    + ('0' + (today.getMonth()+1)).slice(-2) + '-'
    + ('0' + today.getDate()).slice(-2)

    const contacts = await client
      .api('/me/mailFolders/Inbox/messages')      
      .top('1000')
      .filter('receivedDateTime gt ' + afterDate + 'T00:00:00Z')
      .get();
    return contacts;
  },
};

function getAuthenticatedClient(accessToken) {
  const client = graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });
  return client;  
}
