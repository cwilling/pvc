const https = require('https');
const common = require(pvcStartDir + '/pvcCommon.js');


var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  var versions = [];


      // https request
//!!!! Set request path !!!!
      var reqpath = 'download/' + parent.urlbase + '/';

      var requestOptions = {
        headers: {
          'User-Agent': 'pvc: Project Version Checker'
        },
//!!!! Set host name !!!!
        host: 'XYZ.ABC.ORG',
        port: 443,
        path: '/' + reqpath
      };
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

//!!!! Process res_data here, leaving version numbers in versions[] !!!!

          versions.sort( function(a,b) { return naturalCompare(b, a); });

          switch (action) {
            case 'update':
              if (! versions) {
                eventEmitter.emit('UpdateWatcher', parent, void 0);
              } else {
                eventEmitter.emit('UpdateWatcher', parent, versions[0]);
              }
              break
            case 'validate':
              if (! versions) {
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
              if (! versions) {
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

//!!!! Rename template_functions !!!!
template_functions = {
  "check":check
}

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

