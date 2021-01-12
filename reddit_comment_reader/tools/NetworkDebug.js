const ping = require('ping');
// Check general connectivity (google.com) and Reddit connectivity
const hosts = ["google.com", "reddit.com"];

class NetworkDebugger {
  getHostPingStatus() {
    return new Promise(function(resolve, reject) {
      let responses = [];
      for (let i=0; i<hosts.length; i++) {
        ping.promise.probe(hosts[i]).then(function (response) {
          responses.push(response);
          if (responses.length == hosts.length) {
            resolve(responses);
          }
        }).catch(reject);
      };
    });
  }
}


module.exports = new NetworkDebugger();