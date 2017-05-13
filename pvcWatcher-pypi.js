const https = require('https');
const common = require('./pvcCommon.js');


var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  var auth;
  if (config.github && config.github.username) {
    auth = "Basic " + new Buffer(config.github.username + ":" + config.github.token).toString("base64");
  }
  //console.log("check() for project " + parent.project + " with auth = " + auth);

      // https request
      var reqpath = 'pypi/' + parent.urlbase + '/json';
      var requestOptions = {
        headers: {
          'User-Agent': 'pvc: Project Version Checker'
        },
        host: 'pypi.python.org',
        port: 443,
        path: '/' + reqpath
      };
      if (auth) {
        requestOptions.headers['Authorization'] = auth;
      }
      //console.log("Request: " + requestOptions.path);
      var req = https.get(requestOptions, function(response) {
        // handle the response
        var res_data = '';
        response.on('data', function(chunk) {
          //console.log(".....chunk");
          res_data += chunk;
        });
        response.on('end', function() {
          //console.log(res_data);
          var page_data = JSON.parse(res_data);
          if (page_data) {
            var versions = [];
            var releases = Object.keys(page_data.releases);
            for (var i=0;i<releases.length;i++) {
              // Remove non-numeric leading characters before sorting
              //console.log(releases[i]);
              versions.push(releases[i].replace(/^[^0-9]*/, ""));
            }
            versions.sort( function(a,b) { return naturalCompare(b, a); });
          }

          switch (action) {
            case 'update':
              if (page_data == undefined) {
                eventEmitter.emit('UpdateWatcher', parent, void 0);
              } else {
                eventEmitter.emit('UpdateWatcher', parent, versions[0]);
              }
              break
            case 'validate':
              if (page_data == undefined) {
                console.log("ERROR! Request returned: " + res_data);
                eventEmitter.emit('NotValidWatcher', parent);
              } else {
                if (versions[0] != parent.version) {
                  console.log("NOTE: latest version is " + versions[0]);
                  parent.version = versions[0];
                }
                eventEmitter.emit('IsValidWatcher', parent);
              }
              break;
            case 'check':
            default:
              if (page_data == undefined) {
                eventEmitter.emit('CheckedWatcher', parent, void 0);
              } else {
                versions.sort( function(a,b) { return naturalCompare(b, a); });
                eventEmitter.emit('CheckedWatcher', parent, versions[0]);
              }
              break;
          }
        }.bind(parent));
      }.bind(parent));
      req.on('error', function(e) {
        console.log("Got error: " + e.message);
      });
}

pypi_functions = {
  "check":check
}

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

