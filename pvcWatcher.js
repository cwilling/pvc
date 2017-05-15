const https = require('https');
const fs = require("fs");

// Load plugins
pvcRetrievalTypes = []; // Global
var watcherFunctions = {};
function checkName(name) {
    var moduleType = "";
    //console.log("checkName(): " + name);
    if (name.match(/pvcWatcher-\S*.js/)) {
        require("./" + name);
        moduleType = name.replace(/^pvcWatcher-|.js$/g,"");
        pvcRetrievalTypes.push(moduleType);
        watcherFunctions["moduleType"] = moduleType + "_functions";
	//console.log("Module: " + moduleType);
        return true;
    } else {
        return false;
    }
}
var pluginPath = "./";
fs.readdirSync(pluginPath).filter(checkName);
//console.log("pvcRetrievalTypes = " + pvcRetrievalTypes);


function Watcher () {
  //console.log("New Watcher with : ", arguments.length, " arguments");
  var args = Array.prototype.slice.call(arguments);

  if (args.length > 0) {
    this.project = args[0].project;
    this.type = args[0].type;
    this.urlbase = args[0].urlbase;
    this.version = args[0].version;
  } else {
    this.project = "";
    this.type = "";
    this.urlbase = "";
    this.version = "";
  }
};
module.exports = Watcher;

Watcher.prototype.check = function (options) {
  //console.log("check() for project " + this.project);

switch (this.type) {
    case 'github':
      github_functions.check(this, options);
      break;
    case 'sourceforge':
      sourceforge_functions.check(this, options);
      break;
    case 'pypi':
      pypi_functions.check(this, options);
      break;
    case 'libreoffice':
      libreoffice_functions.check(this, options);
      break;
    case 'hackage':
      hackage_functions.check(this, options);
      break;
    case 'live555':
      live555_functions.check(this, options);
      break;
    case 'suitesparse':
      suitesparse_functions.check(this, options);
      break;
    case 'vtk':
      vtk_functions.check(this, options);
      break;
    case 'zpaq':
      zpaq_functions.check(this, options);
      break;
    default:
      console.log("Can't check unknown retrieval type (" + this.type + ")");
      console.log("Must be from " + pvcRetrievalTypes);
      break;
  } /* switch */
}


/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

