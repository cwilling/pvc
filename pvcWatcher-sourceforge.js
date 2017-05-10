const https = require('https');
const common = require('./pvcCommon.js');

var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  //console.log("check() for project " + parent.project);

  // https request
  var acc = parent.urlbase.substr(0, parent.urlbase.indexOf('/'));
  var proj = parent.urlbase.substr(parent.urlbase.indexOf('/') + 1);
  var reqpath = 'projects/' + acc + '/files/' + proj + '/';
  //console.log("reqpath = " + reqpath);

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: 'sourceforge.net',
    port: 443,
    path: '/' + reqpath
  };
  // Don't know what a sourceforge auth looks like ...
  if (config.sourceforge && config.sourceforge.auth) {
    requestOptions.headers['Authorization'] = config.sourceforge.auth;
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
      res_data = res_data.split(/\r?\n/);
      //console.log(res_data);

      var files = '';
      var files_found = false;
      for(var i in res_data) {
          if (res_data[i].search("net.sf.files") > 0) {
              //console.log(res_data[i]);
              var start = res_data[i].indexOf('{');
              var end = res_data[i].indexOf(';');
              //console.log(res_data[i].slice(start, end));
              files = JSON.parse(res_data[i].slice(start, end));
              files_found = true;
              break;
          }
      }
      switch (action) {
        case 'update':
          if ( ! files_found ) {
            eventEmitter.emit('UpdateWatcher', parent, void 0);
          } else {
            var versions = [];
            var rawVersions = Object.keys(files);
            //console.log("Raw versions: " + rawVersions);
            for (var i=0;i<rawVersions.length;i++ ) {
              versions.push(rawVersions[i].replace(/^[^0-9]*/, ""));
            }
            //console.log("Stripped versions: " + versions);
            versions.sort( function(a,b) { return naturalCompare(b, a); });
            eventEmitter.emit('UpdateWatcher', parent, versions[0]);
          }
          break;
        case 'validate':
          if ( ! files_found ) {
            console.log("ERROR! net.sf.files not found in " + res_data);
            eventEmitter.emit('NotValidWatcher', parent);
          } else {
            var versions = [];
            var rawVersions = Object.keys(files);
            //console.log("Raw versions: " + rawVersions);
            for (var i=0;i<rawVersions.length;i++ ) {
              versions.push(rawVersions[i].replace(/^[^0-9]*/, ""));
            }
            //console.log("Stripped versions: " + versions);
            versions.sort( function(a,b) { return naturalCompare(b, a); });
            //console.log("Sorted versions: " + versions);
            if ( versions[0] != parent.version ) {
              console.log("NOTE: latest version is " + versions[0]);
              parent.version = versions[0];
            }
            eventEmitter.emit('IsValidWatcher', parent);
          }
          break;
        case 'check':
        default:
          if ( ! files_found ) {
            eventEmitter.emit('CheckedWatcher', parent, void 0);
          } else {
            var versions = [];
            var rawVersions = Object.keys(files);
            //console.log("Raw versions: " + rawVersions);
            for (var i=0;i<rawVersions.length;i++ ) {
              versions.push(rawVersions[i].replace(/^[^0-9]*/, ""));
            }
            //console.log("Stripped versions: " + versions);
            versions.sort( function(a,b) { return naturalCompare(b, a); });
            eventEmitter.emit('CheckedWatcher', parent, versions[0])
          }
          break;
      } // switch //

    }.bind(parent)); // response.on //
  }.bind(parent));   // https.get //
  req.on('error', function(e) {
    console.log("Error in check() sourceforge https.get: " + e.message);
  });

}


sourceforge_functions = {
  "check":check,
};
//  "isValid":isValid,


/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

