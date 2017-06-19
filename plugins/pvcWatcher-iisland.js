/*
  This one is unusual in that there is no versioned tarball available.
  Therefore we parse the unpacked tarball (like tar -t) and extract
  the version number from the first entry which is the name & version
  of the directory containing the source code.
*/
const request = require('request');
const targz = require('tar.gz');
const http = require('http');
const common = require(pvcStartDir + '/pvcCommon.js');


var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  var entries = [];
  var versions = [];


  var reqpath = 'http://invisible-island.net/datafiles/release/' + parent.urlbase + '.tar.gz';

  var req = request.get(reqpath);
  var parse = targz().createParseStream();

  req.pipe(parse);
  parse.on('entry', function(entry) {
    //console.log(entry.path);
    entries.push(entry.path);
  });

  parse.on('end', function() {
    var replaceMe = new RegExp('^' + parent.urlbase + '-|\\/$', "g");
    versions.push(entries[0].replace(replaceMe, ""));
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
  req.on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

iisland_functions = {
  "check":check
}

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

