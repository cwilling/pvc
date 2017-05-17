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
  //console.log("check() for project " + parent.project + " with auth = " + auth);

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
      //console.log("Request: " + requestOptions.path);

      requestIterator({"action":action,"versions":versions,"parent":parent}, requestOptions, composeData);

}

/* Expect work function to be requestTagData(), callback function to be composeData()
*/
function requestIterator (options, requestOptions, callback) {
//  console.log("requestIterato()");

  function report(newVersions, nextUrl) {

    //if ( "path" in nextUrl) {
    //  console.log("nextUrl = " + JSON.stringify(nextUrl) + "  " + nextUrl.length);
    //} else {
    //  console.log("nextUrl = no path");
    //}

    newVersions.forEach( function (item, index) {
      //console.log("Adding version: " + item);
      options.versions.push(item);
    });
    if ( "path" in nextUrl) {
      // update header with latest path
      requestOptions.host = nextUrl.host;
      requestOptions.path = nextUrl.path;
      requestTagData(requestOptions, report);
    //  console.log("Next request options: " + JSON.stringify(requestOptions));
    } else {
      callback(options.action, options.versions, options.parent);
    }
  }
  requestTagData(requestOptions, report);
}


function requestTagData (requestOptions, reportCallback) {
//  console.log("requestTagData()");
  var nextUrl = {};

  var req = https.get(requestOptions, function(response) {
    //console.log("Status code: " + response.statusCode);
    //console.log("Header: " + JSON.stringify(response.headers));
    //console.log("Header: " + response.headers.link);
    if (response.headers.link) {
      var links = parse_link_header(response.headers.link);
      //console.log("links: " + JSON.stringify(links));
      //for (var i=0;i<links.length;i++) {
      //  console.log("link: " + links[i]);
      //}
      //console.log("Object.keys = " + Object.keys(links));
      if (links.hasOwnProperty('next')) {
        //console.log("Next page is: " + links.next);
        nextUrl = url.parse(links.next);
        //console.log("and path will be: " + nextUrl.path);
        //requestOptions.host = nextUrl.host;
        //requestOptions.path = nextUrl.path;
      //} else {
      //  console.log("Last page!");
      }
    }

    // handle the response
    var res_data = '';
    response.on('data', function(chunk) {
      //console.log(".....chunk");
      res_data += chunk;
    });

    response.on('end', function() {
      //console.log(res_data);
      var page_data = JSON.parse(res_data);
      versions = [];
      if (page_data) {

        // Remove non-numeric leading characters before sorting
        for (var i=0;i<page_data.length;i++) {
          //console.log(page_data[i].name);
          versions.push(page_data[i].name.replace(/^[^0-9]*|-.*$/g, ""));
        }
      }
      //console.log("and path will be: " + nextUrl.path);
      reportCallback(versions, nextUrl);
    });

  });
  req.on('error', function(e) {
    console.log("Got error: " + e.message);
  });

}

// When all data has been collected,
function composeData (action, versions, parent) {
//  console.log("composeData():    action = " + action);
//  console.log("composeData():  versions.length = " + versions.length);
//  console.log("composeData() project:    parent = " + parent.project);

  versions.sort( function(a,b) { return naturalCompare(b, a); });

  switch (action) {
    case 'update':
      if (versions.length == 0) {
        eventEmitter.emit('UpdateWatcher', parent, void 0);
      } else {
        eventEmitter.emit('UpdateWatcher', parent, versions[0]);
      }
      break
    case 'validate':
      if (versions.length == 0) {
        console.log("ERROR! Request returned: " + res_data);
        eventEmitter.emit('NotValidWatcher', parent);
      } else {
        //console.log(versions);
        if (versions[0] != parent.version) {
          console.log("NOTE: latest version is " + versions[0]);
          parent.version = versions[0];
        }
        eventEmitter.emit('IsValidWatcher', parent);
      }
      break;
    case 'check':
    default:
      if (versions.length == 0) {
        eventEmitter.emit('CheckedWatcher', parent, void 0);
      } else {
        eventEmitter.emit('CheckedWatcher', parent, versions[0]);
      }
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

