const https = require('https');
const common = require(pvcStartDir + '/pvcCommon.js');

var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  pvcDebug("check() for project " + parent.project);

  // https request
  var reqpath = parent.urlbase;
  pvcDebug("reqpath = " + reqpath);

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: 'hackage.haskell.org',
    port: 443,
    path: '/package/' + parent.urlbase
  };
  pvcDebug("Request: " + requestOptions.path);

  var req = https.get(requestOptions, function(response) {
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
          if (res_data[i].search("<strong>") > 0) {
              pvcDebug("Found " + res_data[i]);
              version = res_data[i].match(/strong>[0-9.]*<\/strong/)[0].replace('strong>','').replace('</strong','');
              pvcDebug("version = " + version);
              break;
          }
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
  }.bind(parent));   // https.get //
  req.on('error', function(e) {
    console.log("Error in check() vtk https.get: " + e.message);
  });

}


hackage_functions = {
  "check":check,
};


/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

