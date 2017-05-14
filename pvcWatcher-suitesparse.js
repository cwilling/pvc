const http = require('http');
const common = require('./pvcCommon.js');

var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  //console.log("check() for project " + parent.project);

  // http request
  var reqpath = parent.urlbase;
  //console.log("reqpath = " + reqpath);

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: 'faculty.cse.tamu.edu',
    path: '/davis/SuiteSparse/'
  };

  //console.log("Request: " + requestOptions.path);
  var req = http.get(requestOptions, function(response) {
    // handle the response
    var res_data = '';
    response.on('data', function(chunk) {
      //console.log(".....chunk");
      res_data += chunk;
    });
    response.on('end', function() {
      res_data = res_data.split(/\r?\n/);

      var versions = [];
      for(var i in res_data) {
        //console.log("res_data: " + res_data);
        var matched = res_data[i].match(/SuiteSparse-[0-9.]*[0-9]\.tar/);
        if (matched) {
          //console.log("matched: " + matched[0]);
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
            //console.log("ERROR! \"Latest Release\" not found in " + res_data);
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

