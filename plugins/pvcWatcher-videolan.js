const https = require('https');
const common = require(pvcStartDir + '/pvcCommon.js');


var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  var versions = [];

  // https request
  if (parent.urlbase == 'x264') {
    var reqpath = 'pub/videolan/' + parent.urlbase + '/snapshots/';
  } else {
    var reqpath = 'pub/videolan/' + parent.urlbase + '/';
  }

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: 'download.videolan.org',
    port: 443,
    path: '/' + reqpath
  };
  //console.log("Request: " + requestOptions.path);

  var req = https.get(requestOptions, function(response) {
    // handle the response
    var res_data = '';
    response.on('data', function(chunk) {
      //pvcDebug(".....chunk");
      res_data += chunk;
    });
    response.on('end', function() {
      res_data = res_data.split(/\r?\n/);
      //pvcDebug(res_data);

      for (var i=0;i<res_data.length;i++) {
        var extracted = extractVersionId(parent.urlbase, res_data[i]);
        if (extracted) {
          //pvcDebug("extracted = " + extracted);
          versions.push(extracted);
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
            console.log("ERROR! Request returned: " + res_data);
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

function extractVersionId(projectId, rawVersion) {

  switch (projectId) {
    case 'x264':
      //console.log("Quirking version string " + rawVersion + " for project: " + projectId);
      if (rawVersion.search(/-stable\.tar\.bz2</) > 0 ) {
        return rawVersion.replace(/^.*>x264-snapshot-|-stable\.tar\.bz2<.*/g, "");
      }
      break;
    case 'x265':
      //console.log("Quirking version string " + rawVersion + " for project: " + projectId);
      if (rawVersion.search(/>x265_[0-9][0-9.]*\.tar\.gz</) > 0 ) {
        return rawVersion.replace(/.*x265_|\.tar\.gz<.*/g, "");
      }
      break;
    default:
      var matched = rawVersion.match(/>[0-9][0-9.]*\//);
      if (matched) {
        return matched[0].replace(/^>|\/$/g,"");
      }
  }
  // Nothing to see here
  return void 0;
}

videolan_functions = {
  "check":check
}

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

