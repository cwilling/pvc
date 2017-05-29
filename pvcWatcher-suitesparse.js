const http = require('http');
const common = require(pvcStartDir + '/pvcCommon');

var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;

  // http request
  var reqpath = parent.urlbase;
  pvcDebug("reqpath = " + reqpath);

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: 'faculty.cse.tamu.edu',
    path: '/davis/SuiteSparse/'
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

      var versions = [];
      for(var i in res_data) {
        pvcDebug("res_data: " + res_data);
        var matched = res_data[i].match(/SuiteSparse-[0-9.]*[0-9]\.tar/);
        if (matched) {
          pvcDebug("matched: " + matched[0]);
          versions.push(matched[0].replace("SuiteSparse-", "").replace(".tar", ""));
        }
      }
      versions.sort( function(a,b) { return naturalCompare(b, a); });

      switch (action) {
        case 'update':
          if ( ! versions ) {
            eventEmitter.emit('UpdateWatcher', parent, void 0);
          } else {
            eventEmitter.emit('UpdateWatcher', parent, versions[0]);
          }
          break;
        case 'validate':
          if ( ! versions ) {
            pvcDebug("\"Latest Release\" not found in " + res_data,"PVC_ERROR");
            eventEmitter.emit('NotValidWatcher', parent);
          } else {
            if ( versions[0] != parent.version ) {
              console.log("NOTE: latest version is " + versions[0]);
              parent.version = versions[0];
            }
            eventEmitter.emit('IsValidWatcher', parent);
          }
          break;
        case 'check':
        default:
          if ( ! versions ) {
            eventEmitter.emit('CheckedWatcher', parent, void 0);
          } else {
            eventEmitter.emit('CheckedWatcher', parent, versions[0])
          }
          break;
      } // switch //

    }.bind(parent)); // response.on //
  }.bind(parent));   // http.get //
  req.on('error', function(e) {
    console.log("Error in check() suitesparse http.get: " + e.message);
  });

}

suitesparse_functions = {
  "check":check,
};


/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

