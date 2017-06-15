const https = require('https');
const url = require('url');

const common = require('./pvcCommon.js');

/*
  Given enough tags, Github may return them over multiple pages, 1 page per call.
  If such pagination is necessary, each page contains a link to the next.
  Our job is to sequentially run some number of (asynchronous) requests.
*/

// Version strings
var versions = [];

var check = function (parent, options) {
  var action = options.action || 'check';
  var config = options.config || null;
  var auth;
  if (config.github && config.github.username) {
    auth = "Basic " + new Buffer(config.github.username + ":" + config.github.token).toString("base64");
  }
  pvcDebug("check() for project " + parent.project + " with auth = " + auth);

      var nextPage = 1;
      versions = [];

      // https request
      var reqpath = 'repos/' + parent.urlbase + '/tags?page=' + nextPage;
      var requestOptions = {
        headers: {
          'User-Agent': 'pvc: Project Version Checker'
        },
        host: 'api.github.com',
        port: 443,
        path: '/' + reqpath
      };
      if (auth) {
        requestOptions.headers['Authorization'] = auth;
      }
      pvcDebug("Request: " + requestOptions.path);

      requestIterator({"action":action,"versions":versions,"parent":parent}, requestOptions, composeData);

}

/* Expect work function to be requestTagData(), callback function to be composeData()
*/
function requestIterator (options, requestOptions, callback) {
  pvcDebug("requestIterator()");

  function report(newVersions, nextUrl) {

    newVersions.forEach( function (item, index) {
      pvcDebug("Adding version: " + item);
      options.versions.push(item);
    });
    if ( "path" in nextUrl) {
      // update header with latest path
      requestOptions.host = nextUrl.host;
      requestOptions.path = nextUrl.path;
      requestTagData(options.parent.urlbase, requestOptions, report);
      pvcDebug("Next request options: " + JSON.stringify(requestOptions));
    } else {
      callback(options.action, options.versions, options.parent);
    }
  }
  requestTagData(options.parent.urlbase, requestOptions, report);
}


function requestTagData (projectId, requestOptions, reportCallback) {
  pvcDebug("requestTagData() for " + projectId);
  pvcDebug("requestTagData() from " + requestOptions.host);
  var nextUrl = {};

  var req = https.get(requestOptions, function(response) {
    pvcDebug("Status code: " + response.statusCode);
    pvcDebug("Header: " + JSON.stringify(response.headers));
    pvcDebug("Header: " + response.headers.link);
    if (response.headers.link) {
      var links = parse_link_header(response.headers.link);
      pvcDebug("links: " + JSON.stringify(links));
      pvcDebug("Object.keys = " + Object.keys(links));
      if (links.hasOwnProperty('next')) {
        pvcDebug("Next page is: " + links.next);
        nextUrl = url.parse(links.next);
        pvcDebug("and path will be: " + nextUrl.path);
      }
    }

    // handle the response
    var res_data = '';
    response.on('data', function(chunk) {
      pvcDebug(".....chunk");
      res_data += chunk;
    });

    response.on('end', function() {
      pvcDebug(res_data);
      var page_data = JSON.parse(res_data);
      versions = [];
      if (page_data) {
        for (var i=0;i<page_data.length;i++) {
          var extracted = extractVersionId(projectId, page_data[i].name);
          if (extracted != undefined ) {
            pvcDebug("Extracted version is: " + extractVersionId(projectId, page_data[i].name));
            versions.push(extracted);
          }
        }
      }
      pvcDebug("and path will be: " + nextUrl.path);
      reportCallback(versions, nextUrl);
    });

  });
  req.on('error', function(e) {
    console.log("Got error: " + e.message);
  });

}

// When all data has been collected,
function composeData (action, versions, parent) {
  pvcDebug("composeData():    action = " + action);
  pvcDebug("composeData():  versions.length = " + versions.length);
  pvcDebug("composeData() project:    parent = " + parent.project);

  pvcDebug("Sorting " + versions);
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
        pvcDebug(versions);
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
        eventEmitter.emit('CheckedWatcher', parent, versions[0]);
      }
      break;
  }
}

/* extractVersionId(projectId, rawVersion)
    - projectId is the Github :owner/:project string
    - rawVersion is the version string to be processed

   Based on known quirky strings from particular repos (projectId),
   massage rawVersion into an acceptable form & return correct version string
*/
function extractVersionId(projectId, rawVersion) {

  switch (projectId) {
    case 'att/ast':
      // ksh93 (hopefully no others use this projectId)
      pvcDebug("Quirking version string " + rawVersion + " for project: " + projectId);
      var matched = rawVersion.match(/SH_RELEASE/);
      if (matched) {
        var words = rawVersion.split();
        return words[2].split()[1];
      }
      break;
    case 'OpenImageIO/oiio':
      pvcDebug("Quirking version string " + rawVersion + " for project: " + projectId);
      if (rawVersion.search(/^Release-[0-9.]*$/) == 0 ) {
        return rawVersion.replace(/^[^0-9]*|-.*$/g, "");
      }
      break;
    case 'gphoto/gphoto2':
      pvcDebug("Quirking version string " + rawVersion + " for project: " + projectId);
      var matched = rawVersion.match(/gphoto2-[0-9][0-9_]*-release/);
      if (matched) {
        return rawVersion.replace(/^gphoto2-|-release$/g, "");
      }
      break;
    default:
      // First remove non-numeric leading characters and suffixes like "-source" etc.
      var partlyDone = rawVersion.replace(/^[^0-9]*|-.*$/g, "");
      pvcDebug("partlyDone = " + partlyDone);

      // Assume any remaining non-numeric character is "rc1" or similar so reject
      var matched = partlyDone.match(/[^0-9.]/, "");
      if (! matched) {
        return partlyDone;
      }
      pvcDebug("Dropping: " + partlyDone + " (" + matched + ")");
      break;
  }
}

// From Gilmargolin & JBKahn: https://gist.github.com/niallo/3109252
function parse_link_header(header) {
  if (header.length === 0) {
    throw new Error("input must not be of zero length");
  }

  // Split parts by comma
  var parts = header.split(',');
  var links = {};
  // Parse each part into a named link
  for(var i=0; i<parts.length; i++) {
    var section = parts[i].split(';');
    if (section.length !== 2) {
      throw new Error("section could not be split on ';'");
    }
    var url = section[0].replace(/<(.*)>/, '$1').trim();
    var name = section[1].replace(/rel="(.*)"/, '$1').trim();
    links[name] = url;
  }
  return links;
}

github_functions = {
  "check":check
}

/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

