const https = require('https');
const common = require(pvcStartDir + '/pvcCommon.js');

var check = function (parent, options) {
  var action = options.action || 'check';
  pvcDebug("check() for project " + parent.project);

  // https request
  var reqpath = 'download/' + parent.urlbase + '/';

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: 'www.libreoffice.org',
    port: 443,
    path: '/' + reqpath
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
      pvcDebug(res_data);

      var tarballName;
      var version;
      for(var i in res_data) {
          pvcDebug(":::: " + res_data[i]);
          var lomatch = res_data[i].replace(/\?/,"   ").match(/libreoffice-[0-9].*\.tar\.[a-z]*/);
          pvcDebug(">>>> " + typeof(lomatch) + "   " + lomatch);
          if (lomatch) {
            pvcDebug(">>>> " + lomatch.length + "  " + lomatch);
            tarballName = lomatch[0].substr(0, lomatch[0].indexOf(" "));
            pvcDebug("Found tarballName: " + tarballName);
            break;
          }
      }
      if (tarballName ) {
        version = tarballName.replace(/^[^0-9]*|[^0-9]*$/g, "");
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
            pvcDebug("tarball download not found in " + res_data, "PVC_ERROR");
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
    }.bind(parent)); // reponse.on //
  }.bind(parent));   // https.get //
  req.on('error', function(e) {
    console.log("Error in check() sourceforge https.get: " + e.message);
  });

}


libreoffice_functions = {
  "check":check,
};


/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

