const https = require('https');
const common = require('./pvcCommon.js');

var check = function (parent, options) {
  var action = options.action || 'check';
  //console.log("check() for project " + parent.project);

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
  //console.log("Request: " + requestOptions.path);
  var req = https.get(requestOptions, function(response) {
    // handle the response
    var res_data = '';
    response.on('data', function(chunk) {
      //console.log(".....chunk");
      res_data += chunk;
    });
    response.on('end', function() {
      res_data = res_data.split(/\r?\n/);
      //console.log(res_data);

      var tarballName = '';
      for(var i in res_data) {
          //console.log(":::: " + res_data[i]);
          var lomatch = res_data[i].replace(/\?/,"   ").match(/libreoffice-[0-9].*\.tar\.[a-z]*/);
          //console.log(">>>> " + typeof(lomatch) + "   " + lomatch);
          if (lomatch) {
            //console.log(">>>> " + lomatch.length + "  " + lomatch);
            tarballName = lomatch[0].substr(0, lomatch[0].indexOf(" "));
            //console.log("Found tarballName: " + tarballName);
            break;
          }
      }

      switch (action) {
        case 'update':
          if ( ! tarballName ) {
            eventEmitter.emit('UpdateWatcher', parent, void 0);
          } else {
            var version = tarballName.replace(/^[^0-9]*|[^0-9]*$/g, "");
            eventEmitter.emit('UpdateWatcher', parent, version);
          }
          break;
        case 'validate':
          if ( ! tarballName ) {
            console.log("ERROR! tarball download not found in " + res_data);
            eventEmitter.emit('NotValidWatcher', parent);
          } else {
            var version = tarballName.replace(/^[^0-9]*|[^0-9]*$/g, "");
            if ( version != parent.version ) {
              console.log("NOTE: latest version is " + version);
              parent.version = version;
            }
            eventEmitter.emit('IsValidWatcher', parent);
          }
          break;
        case 'check':
        default:
          if ( ! tarballName ) {
            eventEmitter.emit('CheckedWatcher', parent, void 0);
          } else {
            var version = tarballName.replace(/^[^0-9]*|[^0-9]*$/g, "");
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

