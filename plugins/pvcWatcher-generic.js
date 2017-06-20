const https = require('https');
const common = require(pvcStartDir + '/pvcCommon.js');


var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  var versions = [];
  var host, reqpath;


  // https request
  switch (parent.urlbase) {
    case 'cups-filters':
      host = 'www.openprinting.org';
      reqpath = 'download/' + parent.urlbase + '/';
      break;
    case 'ghostscript':
      host = 'ghostscript.com';
      reqpath = 'download/' + 'gsdnld.html';
      break;
    case 'ispell':
      host = 'www.cs.hmc.edu';
      reqpath = '~geoff/ispell.html';
      break;
    case 'libx86':
      host = 'www.codon.org.uk';
      reqpath = '~mjg59/' + parent.urlbase + '/downloads/';
      break;
    case 'jove':
      host = 'www.cs.toronto.edu';
      reqpath = 'pub/hugh/jove-dev/';
      break;
    case 'ksh93':
      host = 'raw.githubusercontent.com';
      reqpath = 'att/ast/master/src/cmd/ksh93/include/version.h';
      break;
    case 'mariadb':
      host = 'downloads.mariadb.org';
      reqpath = '/';
      break;
    case 'moc':
      host = 'moc.daper.net';
      reqpath = 'download/';
      break;
    case 'powertop':
      host = '01.org';
      reqpath = parent.urlbase + '/downloads/';
      break;
    case 'sqlite':
      host = 'sqlite.org';
      reqpath = 'download.html';
      break;
    case 'sudo':
      host = 'www.sudo.ws';
      reqpath = 'sudo/download.html';
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
    port: 443,
    path: '/' + reqpath
  };
  pvcDebug("Request: " + requestOptions.path);

  var req = https.get(requestOptions, function(response) {
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
    case 'cups-filters':
      var matched = rawVersion.match(/[0-9]\.[0-9.]*\.tar\.[bglx]z2*/);
      if (matched) {
        //console.log("MATCHED = " + matched[0]);
        return matched[0].replace(/\.tar\.[bglx]z2*$/g,"");
      }
      break;
    case 'jove':
      var matched = rawVersion.match(/>jove[0-9][0-9.]*\.tgz</);
      if (matched) {
        //console.log("MATCHED = " + matched[0]);
        return matched[0].replace(/^>jove|\.tgz<$/g,"");
      }
      break;
    case 'ksh93':
      var matched = rawVersion.match(/SH_RELEASE/);
      if (matched) {
        //console.log("matched = " + matched[0]);
        var words = rawVersion.split(' ');
        return words[2].replace(/"/, '');
      }
      break;
    case 'mariadb':
      var matched = rawVersion.match(/Download [0-9][0-9.]* Stable/);
      if (matched) {
        //console.log("matched = " + matched[0]);
        return matched[0].replace(/^Download | Stable$/g,"");
      }
      break;
    case 'moc':
      var stable = rawVersion.match(/Stable:/);
      if (stable) {
        var matched = rawVersion.match(/moc-[0-9][0-9.]*\.tar\.[bglx]z2*/);
        if (matched) {
          //console.log("matched = " + matched[0]);
          return matched[0].replace(/^moc-|\.tar\.[bglx]z2*$/g,"");
        }
      }
      break;
    case 'powertop':
      var head = new RegExp(projectId + '-v*', "");
      var findMe = new RegExp(head.source + '[0-9][0-9.]*[0-9].*\\.tar\\.[bglx]z2*\\"', "");
      var matched = rawVersion.match(findMe);
      if (matched) {
        pvcDebug("Matched: " + matched);
        var replaceMe = new RegExp(head.source + '|\\.tar\\.[bglx]z2*\\"', "g");
        return matched[0].replace(replaceMe, "");
      }
      break;
    case 'sqlite':
      var matched = rawVersion.match(/>sqlite-src-[0-9]*\..*</);
      if (matched) {
        //console.log("MATCHED = " + matched[0]);
        return matched[0].replace(/^>sqlite-src-|\..*<$/g, "");
      }
      break;
    case 'ghostscript':
    case 'ispell':
      var head = new RegExp(projectId + '-', "");
      var findMe = new RegExp(head.source + '[0-9][0-9.]*[0-9]\\.tar\\.[bglx]z2*', "");
      var matched = rawVersion.match(findMe);
      if (matched) {
        var replaceMe = new RegExp(head.source + '|\\.tar\\.[bglx]z2*', "g");
        return matched[0].replace(replaceMe, "");
      }
      break;
    case 'sudo':
      // Allow non-numeric version strings e.g 1.8.20p2
      var head = new RegExp('>' + projectId + '-', "");
      var findMe = new RegExp(head.source + '[0-9][0-9.]*.*\\.tar\\.[bglx]z2*<', "");
      var matched = rawVersion.match(findMe);
      if (matched) {
        var replaceMe = new RegExp(head.source + '|\\.tar\\.[bglx]z2*<', "g");
        return matched[0].replace(replaceMe, "");
      }
      break;
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

generic_functions = {
  "check":check
}

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

