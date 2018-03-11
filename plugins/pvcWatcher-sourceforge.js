const https = require('https');
const common = require(pvcStartDir + '/pvcCommon.js');

var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  pvcDebug("check() for project " + parent.project);

  // https request
  var acc = parent.urlbase.substr(0, parent.urlbase.indexOf('/'));
  var proj = parent.urlbase.substr(parent.urlbase.indexOf('/') + 1);
  var reqpath;
  // Deal with oddballs
  switch (acc) {
      case 'cdrtools':
      case 'terminus-font':
        reqpath = 'projects/' + acc + '/files/';
        break
      case 'opencore-amr':
        reqpath = 'projects/' + acc + '/files/opencore-amr/';
        break
      case 'joe':
        reqpath = 'projects/joe-editor/files/JOE%20sources/';
        break
      default:
        reqpath = 'projects/' + acc + '/files/' + proj + '/';
        break;
  }
  pvcDebug("reqpath = " + reqpath);

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
  pvcDebug("Request: " + requestOptions.path);

  var req = https.get(requestOptions, function(response) {
    // handle the response
    var res_data = '';
    response.on('data', function(chunk) {
      //pvcDebug(".....chunk");
      res_data += chunk;
    });
    response.on('end', function() {
      res_data = res_data.split(/\r?\n/);
      pvcDebug(res_data);

      var files;
      var versions = [];
      for(var i in res_data) {
          //console.log(res_data[i]);
          if (res_data[i].search("net.sf.files") > 0) {
              //console.log(res_data[i]);
              var start = res_data[i].indexOf('{');
              var end = res_data[i].indexOf(';');
              //console.log(res_data[i].slice(start, end));
              files = JSON.parse(res_data[i].slice(start, end));
              break;
          }
      }
      if (files) {
        var rawVersions = Object.keys(files);
        //console.log("Raw versions: " + rawVersions);
        for (var i=0;i<rawVersions.length;i++ ) {
          var extracted = extractVersionId(parent.urlbase, rawVersions[i]);
          if (extracted) {
            //console.log("extracted = " + extracted);
            versions.push(extracted);
          }
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
          break;
        case 'validate':
          if (! versions) {
            pvcDebug("net.sf.files not found in " + res_data, "PVC_ERROR");
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
          if (! versions) {
            eventEmitter.emit('CheckedWatcher', parent, void 0);
          } else {
            eventEmitter.emit('CheckedWatcher', parent, versions[0])
          }
          break;
      } // switch //

    }.bind(parent)); // response.on //
  }.bind(parent));   // https.get //

  req.on('error', function(e) {
    console.log("(" + parent.project + ":" + parent.type + ":" + parent.urlbase + ") Error: " + e.message);
    eventEmitter.emit('CheckedWatcher', parent, void 0);
  }.bind(parent));

}

function extractVersionId(projectId, rawVersion) {
  //console.log(rawVersion);
  switch (projectId) {
    case 'cdrtools/cdrtools':
      var matched = rawVersion.match(/cdrtools-[0-9][0-9.]*[0-9]\.tar\.gz/);
      if (matched) {
        //console.log("Matched " + matched[0]);
        return matched[0].replace(/cdrtools-|\.tar\.gz/g, "");
      }
      break;
    case 'mad/madplay':
      return rawVersion;
      break;
    default:
      //console.log(rawVersion);
      //return rawVersion.replace(/^[^0-9]*/, "");
      var matched = rawVersion.match(/[0-9][0-9.]*/, '');
      if (matched) return matched[0];
      break;
  }
}

sourceforge_functions = {
  "check":check,
};


/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

