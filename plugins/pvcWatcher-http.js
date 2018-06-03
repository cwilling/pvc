const http = require('http');
const common = require(pvcStartDir + '/pvcCommon.js');


var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  var versions = [];
  var host, reqpath;


  // http request
  switch (parent.urlbase) {
    case 'dvd+rw-tools':
      host = 'fy.chalmers.se';
      reqpath = '~appro/linux/DVD+RW/tools/';
      break;
    case 'itstool':
      host = 'files.itstool.org';
      reqpath = parent.urlbase + '/';
      break;
    case 'live555':
      host = 'www.live555.com';
      reqpath = 'liveMedia/public/';
      break;
    case 'jed':
    case 'most':
      host = 'www.jedsoft.org';
      reqpath = 'releases/' + parent.urlbase + '/';
      break;
    case 'PyGreSQL':
      host = 'www.pygresql.org';
      reqpath = 'files/';
      break;
    case 'soma':
      host = 'www.dawoodfall.net';
      reqpath = 'slackbuilds/noversion/soma/';
      break;
    case 'suitesparse':
      host = 'faculty.cse.tamu.edu';
      reqpath = '/davis/SuiteSparse/';
      break;
    case 'workbone':
      host = 'archive.debian.org';
      reqpath = 'debian-archive/debian/dists/Debian-2.2/main/source/sound/';
      break;
    case 'zpaq':
      host = 'mattmahoney.net';
      reqpath = '/dc/zpaq.html';
      break;
    default:
      console.log("Unhandled software (" + parent.urlbase + ") at generic module.");
      process.exit(5);
      break;
  }

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: host,
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
    console.log("(" + parent.project + ":" + parent.type + ":" + parent.urlbase + ") Error: " + e.message);
    eventEmitter.emit('CheckedWatcher', parent, void 0);
  }.bind(parent));
}

function extractVersionId(projectId, rawVersion) {
switch (projectId) {
    case 'dvd+rw-tools':
      var findMe = RegExp('tools-[0-9][0-9.]*\\.tar\\.gz', '');
      var matched = rawVersion.match(findMe);
      if (matched) {
        pvcDebug("MATCHED: " + matched[0]);
        var replaceMe = RegExp('^tools-|\\.tar\\.gz$', 'g');
        return matched[0].replace(replaceMe, '');
      }
      break;
    case 'live555':
      var matched = rawVersion.match(/live\.[0-9.]*/);
      if (matched) {
        pvcDebug("MATCHED: " + matched);
        return matched[0].replace(/^[^0-9]*|\.$/g, '');
      }
      break;
    case 'jed':
    case 'most':
    case 'PyGreSQL':
      //console.log(res_data[i]);
      var head = new RegExp(projectId + '-', "");
      var findMe = new RegExp(head.source + '[0-9][0-9.-]*.\\.tar\\.[bglx]z2*', "");
      var matched = rawVersion.match(findMe);
      if (matched) {
        var replaceMe = new RegExp(head.source + '|\\.tar\\.[bglx]z2*$', "g");
        //console.log("MATCHED = " + matched[0]);
         return matched[0].replace(replaceMe, "");
      }
      break;
    case 'suitesparse':
      var matched = rawVersion.match(/SuiteSparse-[0-9.]*[0-9]\.tar/);
      if (matched) {
        pvcDebug("matched: " + matched[0]);
        //return matched[0].replace("SuiteSparse-", "").replace(".tar", "");
        return matched[0].replace(/^SuiteSparse-|\.tar$/g, "");
      }
      break;
    case 'workbone':
      // Use underscore as name/version separator e.g. debian sources
      var head = new RegExp('>' + projectId + '_', "");
      var findMe = new RegExp(head.source + '[0-9][0-9.]*\\.orig\\.tar\\.[bglx]z2*<', "");
      var matched = rawVersion.match(findMe);
      if (matched) {
        var replaceMe = new RegExp(head.source + '|\\.orig\\.tar\\.[bglx]z2*<', "g");
        return matched[0].replace(replaceMe, "");
      }
      break;
    case 'something':
      // Allow non-numeric version strings e.g 1.8.20p2
      var head = new RegExp('>' + projectId + '-', "");
      var findMe = new RegExp(head.source + '[0-9][0-9.]*.*\\.tar\\.[bglx]z2*<', "");
      var matched = rawVersion.match(findMe);
      if (matched) {
        var replaceMe = new RegExp(head.source + '|\\.tar\\.[bglx]z2*<', "g");
        return matched[0].replace(replaceMe, "");
      }
      break;
    case 'zpaq':
      var matched = rawVersion.match(/>zpaq v[0-9.]*[0-9]</);
      if (matched) {
        pvcDebug("matched: " + matched[0]);
         return matched[0].replace(">zpaq v", "").replace("<", "");
      }
    case 'itstool':
    case 'soma':
    default:
      // Allow only numeric version strings (no trailing rc1 etc.)
      var head = new RegExp('>' + projectId + '-', "");
      var findMe = new RegExp(head.source + '[0-9][0-9.]*[0-9]\\.tar\\.[bglx]z2*<', "");
      var matched = rawVersion.match(findMe);
      if (matched) {
        var replaceMe = new RegExp(head.source + '|\\.tar\\.[bglx]z2*<', "g");
        return matched[0].replace(replaceMe, "");
      }
      break;
  }
}

http_functions = {
  "check":check
}

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

