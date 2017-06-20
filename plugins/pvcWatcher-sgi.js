const Client = require('ftp');
const common = require(pvcStartDir + '/pvcCommon.js');


var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  var versions = [];


  // ftp request
  var reqpath = 'projects/xfs/cmd_tars/';

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: 'oss.sgi.com'
  };
  pvcDebug("Request: " + reqpath);

  var req = new Client();
  req.connect(requestOptions);
  req.on('ready', function() {
    req.list(reqpath, function(err, res_data) {
      if (err) throw err;

      //console.dir(res_data);
      req.end();

      for (var i=0;i<res_data.length;i++) {
        pvcDebug(res_data[i]);
        var extracted = extractVersionId(parent.urlbase, res_data[i].name);
        if (extracted) {
          pvcDebug("extracted = " + extracted);
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
    console.log("(" + parent.project + ":" + parent.type + ":" + parent.urlbase + ") Error: " + e.message);
    eventEmitter.emit('CheckedWatcher', parent, void 0);
  }.bind(parent));
}

function extractVersionId(projectId, rawVersion) {
    var head = new RegExp(projectId + '-', "");
    var findMe = new RegExp(head.source + '[0-9][0-9.]*[0-9].*\\.tar\\.gz', "" );
    var replaceMe = new RegExp(head.source+ '|\\.tar\\.gz', "g");
    var matched = rawVersion.match(findMe);
    if (matched) {
      //console.log("Matched: " + matched[0] + " => " + matched[0].replace(replaceMe, ""));
      return matched[0].replace(replaceMe, "");
    }
}


sgi_functions = {
  "check":check
}

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

