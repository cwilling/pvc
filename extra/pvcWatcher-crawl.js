const https = require('https');
const common = require(pvcStartDir + '/pvcCommon.js');


var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  var versions = [];


  // https request
  var reqpath = 'release/current/';

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: 'crawl.develz.org',
    port: 443,
    path: '/' + reqpath
  };
  pvcDebug("Request: " + requestOptions.path);

  var req = https.get(requestOptions, function(response) {
    // handle the response
    var res_data = '';
    response.on('data', function(chunk) {
      //console.log(".....chunk");
      res_data += chunk;
    });
    response.on('end', function() {
      res_data = res_data.split(/\r?\n/);
      //pvcDebug(res_data);

      for (var i=0;i<res_data.length;i++) {
        //console.log(res_data[i]);
        var matched = res_data[i].match(/-[0-9][0-9.]*\.tar\.xz/);
        if (matched) {
          //console.log("matched = " + matched[0]);
          versions.push(matched[0].replace(/^-|\.tar\.xz/g,""));
        }
      }
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
            pvcDebug("Request returned: " + res_data, 'PVC_ERROR');
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
    console.log("(" + parent.project + ":" + parent.type + ":" + parent.urlbase + ") Error: " + e.message);
    eventEmitter.emit('CheckedWatcher', parent, void 0);
  }.bind(parent));
}

crawl_functions = {
  "check":check
}

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

