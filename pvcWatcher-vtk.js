const http = require('http');
const common = require(pvcStartDir + '/pvcCommon.js');

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
    host: 'www.vtk.org',
    path: '/download/'
  };
  //console.log("Request: " + JSON.stringify(requestOptions, null, 1));

  var req = http.get(requestOptions, function(response) {
    // handle the response
    var res_data = '';
    response.on('data', function(chunk) {
      //console.log(".....chunk");
      res_data += chunk;
    });
    response.on('end', function() {
      res_data = res_data.split(/\r?\n/);

      var version;
      for(var i in res_data) {
          if (res_data[i].search("latest") > 0) {
              //console.log("Found " + res_data[i]);
              var start = res_data[i].indexOf('(');
              var end = res_data[i].indexOf(')');
              version = res_data[i].slice(start+1, end);
              //console.log("version = " + version);
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
            //console.log("ERROR! \"Latest Release\" not found in " + res_data);
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
    console.log("Error in check() vtk http.get: " + e.message);
  });

}


vtk_functions = {
  "check":check,
};


/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

