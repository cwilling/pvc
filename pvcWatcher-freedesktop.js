const https = require('https');
const common = require(pvcStartDir + '/pvcCommon.js');


var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  var versions = [];


  // https request
//!!!! Set request path !!!!
  // freedesktop layout is not entirely consistence, hence the switch
  switch (parent.urlbase) {
    case 'PackageKit':
    case 'pulseaudio':
    case 'plymouth':
    case 'realmd':
    case 'tartan':
    case 'uchardet':
    case 'xdg-app':
      var reqpath = 'software/' + parent.urlbase + '/releases/';
      break;
    case 'harfbuzz':
      var reqpath = 'software/' + parent.urlbase + '/release/';
      break;
    case 'paprefs':
    case 'pavucontrol':
      var reqpath = 'software/pulseaudio/' + parent.urlbase + '/';
      break;
    case 'ModemManager':
    case 'evemu':
    case 'accountsservice':
    case 'bustle':
    case 'libevdev':
    case 'libinput':
    case 'libmbim':
    case 'libqmi':
    case 'media-player-info':
    case 'shared-mime-info':
    case 'virgl':
      var reqpath = 'software/' + parent.urlbase + '/';
      break;
    case 'libva':
      var reqpath = 'software/vaapi/releases/' + parent.urlbase + '/';
      break;
    case 'adcli':
      var reqpath = 'software/realmd/releases/';
      break;
    case 'PackageKit-Qt':
      var reqpath = 'software/PackageKit/releases/';
      break;
    case 'libqmi-glib':
      var reqpath = 'software/libqmi/' + parent.urlbase + '/';
      break;
    default:
      console.log("Unhandled software (" + parent.urlbase + ") at freedesktop module.");
      process.exit(5);
      break;
  }

  var requestOptions = {
    headers: {
      'User-Agent': 'pvc: Project Version Checker'
    },
    host: 'freedesktop.org',
    port: 443,
    path: '/' + reqpath
  };
  //console.log("Request: " + requestOptions.path);

  var req = https.get(requestOptions, function(response) {
    // handle the response
    var res_data = '';
    response.on('data', function(chunk) {
      //console.log(".....chunk");
      res_data += chunk;
    });
    response.on('end', function() {
      res_data = res_data.split(/\r?\n/);
      //console.log(res_data);

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
    console.log("Got error: " + e.message);
  });
}

function extractVersionId(projectId, rawVersion) {
  switch (projectId) {
  case 'paprefs':
  case 'pavucontrol':
    var matched = rawVersion.match(/>[0-9][0-9.]*</);
    if (matched) {
      return matched[0].replace(/^>|<$/g,"");
    }
    break;
  case 'bustle':
  case 'libqmi-glib':
    var matched = rawVersion.match(/>[0-9][0-9.]*\//);
    if (matched) {
      return matched[0].replace(/^>|\/$/g,"");
    }
    break;
  case 'virgl':
    var head = new RegExp('>virglrenderer-', "");
    var findMe = new RegExp(head.source + '[0-9][0-9.]*[0-9]\\.tar\\.[bgx]z2*<', "");
    var replaceMe = new RegExp(head.source + '|\\.tar\\.[bgx]z2*<', "g");
    var matched = rawVersion.match(findMe);
    if (matched) {
      return matched[0].replace(replaceMe, "");
    }
    break;
  case 'ModemManager':
  case 'PackageKit':
  case 'PackageKit-Qt':
  case 'adcli':
  case 'accountsservice':
  case 'evemu':
  case 'harfbuzz':
  case 'libinput':
  case 'libevdev':
  case 'libmbim':
  case 'libqmi':
  case 'libva':
  case 'media-player-info':
  case 'plymouth':
  case 'pulseaudio':
  case 'realmd':
  case 'shared-mime-info':
  case 'tartan':
  case 'uchardet':
  case 'xdg-app':
    var head = new RegExp('>' + projectId + '-', "");
    var findMe = new RegExp(head.source + '[0-9][0-9.]*[0-9]\\.tar\\.[bgx]z2*<', "");
    var replaceMe = new RegExp(head.source + '|\\.tar\\.[bgx]z2*<', "g");
    var matched = rawVersion.match(findMe);
    if (matched) {
      return matched[0].replace(replaceMe, "");
    }
    break;
  default:
    break;
  }
  return void 0;
}

freedesktop_functions = {
  "check":check
}

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

