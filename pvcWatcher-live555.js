const http = require('http');
const common = require(pvcStartDir + '/pvcCommon.js');

var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  pvcDebug("check() for project " + parent.project);

  // http request
  var reqpath = parent.urlbase;
  pvcDebug("reqpath = " + reqpath);

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: 'www.live555.com',
    path: '/liveMedia/public/'
  };

  pvcDebug("Request: " + requestOptions.path);
  var req = http.get(requestOptions, function(response) {
    // handle the response
    var res_data = '';
    response.on('data', function(chunk) {
      pvcDebug(".....chunk");
      res_data += chunk;
    });
    response.on('end', function() {
      res_data = res_data.split(/\r?\n/);

      var version;
      for(var i in res_data) {
        pvcDebug("res_data: " + res_data);
        var matched = res_data[i].match(/live\.[0-9.]*/);
        pvcDebug("matched: " + matched);
        if (matched) {
          version = matched[0].replace(/^[^0-9]*|\.$/g, '');
          pvcDebug("version: " + version);
        }
        if (version) break;
      }
      switch (action) {
        case 'update':
          if (! version) {
            eventEmitter.emit('UpdateWatcher', parent, void 0);
          } else {
            eventEmitter.emit('UpdateWatcher', parent, version);
          }
          break;
        case 'validate':
          if (! version) {
            pvcDebug("ERROR! \"Latest Release\" not found in " + res_data);
            eventEmitter.emit('NotValidWatcher', parent);
          } else {
            if ( version != parent.version ) {
              console.log("NOTE: latest version is " + version);
              parent.version = version;
            }
            eventEmitter.emit('IsValidWatcher', parent);
          }
          break;
        case 'check':
        default:
          if (! version) {
            eventEmitter.emit('CheckedWatcher', parent, void 0);
          } else {
            eventEmitter.emit('CheckedWatcher', parent, version)
          }
          break;
      } // switch //

    }.bind(parent)); // response.on //
  }.bind(parent));   // http.get //
  req.on('error', function(e) {
    console.log("Error in check() live555 http.get: " + e.message);
  });

}


live555_functions = {
  "check":check,
};


/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

