const https = require('https');
const common = require(pvcStartDir + '/pvcCommon.js');


var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  var versions = [];


  // https request
  var reqpath = 'projects/slackbuildsdirectlinks/files/' + parent.urlbase + '/';

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: 'sourceforge.net',
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

      var files;
      var versions = [];
      for(var i in res_data) {
        if (res_data[i].search("net.sf.files") > 0) {
          pvcDebug(res_data[i]);
          var start = res_data[i].indexOf('{');
          var end = res_data[i].indexOf(';');
          pvcDebug(res_data[i].slice(start, end));
          files = JSON.parse(res_data[i].slice(start, end));
          break;
        }
      }
      if (files) {
        var rawVersions = Object.keys(files);
        pvcDebug("Raw versions: " + rawVersions);
        for (var i=0;i<rawVersions.length;i++ ) {
          //versions.push(rawVersions[i].replace(/^[^0-9]*|[^0-9]*$/g, ""));
          var extracted = extractVersionId(parent.urlbase, rawVersions[i]);
          if (extracted) {
            versions.push(extracted);
          }
        }
      }

      pvcDebug("raw versions: " + versions);
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
            pvcDebug("ERROR! Request returned: " + res_data, "PVC_ERROR");
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

function extractVersionId(projectId, rawVersion) {
  switch (projectId) {
    case 'libtar':
        if (rawVersion.search(/libtar-/) == 0) {
          return rawVersion.replace(/^[^0-9]*|[^0-9]*$/g, "");
        }
      break;
    default:
        return rawVersion.replace(/^[^0-9]*|[^0-9]*$/g, "");
      break;
  }
  return void 0;
}

sbdirectlinks_functions = {
  "check":check
}

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

