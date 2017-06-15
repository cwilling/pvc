const http = require('http');
const common = require(pvcStartDir + '/pvcCommon.js');


var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  var versions = [];


  // http request
  if (parent.urlbase == 'vorbis-tools') {
    var reqpath = 'releases/vorbis/';
  } else {
    var reqpath = 'releases/' + parent.urlbase + '/';
  }

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: 'downloads.xiph.org',
    path: '/' + reqpath
  };
  pvcDebug("Request: " + requestOptions.path);

  var req = http.get(requestOptions, function(response) {
    // handle the response
    var res_data = '';
    response.on('data', function(chunk) {
      //console.log(".....chunk");
      res_data += chunk;
    });
    response.on('end', function() {
      res_data = res_data.split(/\r?\n/);
      //pvcDebug(res_data);

      for (var i=0;i<res_data.length;i++) {
        //console.log(res_data[i]);
        var extracted = extractVersionId(parent.urlbase, res_data[i]);
        if (extracted) {
          //console.log("extracted = " + extracted);
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
            pvcDebug("Request returned: " + res_data, 'PVC_ERROR');
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
    case 'cdparanoia':
      var head = RegExp(projectId + '-III-','');
      var findMe = RegExp(head.source + '[0-9][0-9.]*[0-9]\\.src\\.tgz', '');
      var matched = rawVersion.match(findMe);
      if (matched) {
        var replaceMe = RegExp(head.source + '|\\.src\\.tgz', 'g');
        //console.log("MATCHED: " + matched[0] + " => " + matched[0].replace(replaceMe, ''));
        return matched[0].replace(replaceMe, '');
      }
      break;
    case 'vorbis-tools':
      var head = RegExp('>' + projectId + '-', '');
      var findMe = RegExp(head.source + '[0-9][0-9.]*\\.tar\\.[bglx]z2*<', '');
      var matched = rawVersion.match(findMe);
      if (matched) {
        var replaceMe = RegExp(head.source + '|\\.tar\\.[bglx]z2*<$', 'g');
        return matched[0].replace(replaceMe, '');
      }
      break
    case 'flac':
    default:
      var matched = rawVersion.match(/[0-9][0-9.]*\.tar\.[glx]z/);
      if (matched) {
        return matched[0].replace(/\.tar\.[glx]z/g,"");
      }
      break;
  }
}

xiph_functions = {
  "check":check
}

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

