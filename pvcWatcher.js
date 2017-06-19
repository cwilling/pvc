const fs = require("fs");

// Load plugins
var pluginPaths = ['./plugins', pvcLocalDir];
var watcherFunctions = {};
pvcRetrievalTypes = []; // Global from pvc
pvcStartDir = __dirname + '/plugins'; // global for modules

pluginPaths.forEach( function (path, index) {
  //console.log("Doing: " + path + "  " + index);
  /* Used to be fs.readdirSync(path).filter(checkName);
     Now anonymous inline to use "path" variable for module loading
  */
  fs.readdirSync(path).filter( function (name) {
    var moduleType = "";
    //console.log("checkName(): " + name + " path: " + path);
    if (name.match(/^pvcWatcher-\S*.js/)) {
        require(path + "/" + name);
        moduleType = name.replace(/^pvcWatcher-|.js$/g,"");
        pvcRetrievalTypes.push(moduleType);
        watcherFunctions["moduleType"] = moduleType + "_functions";
	//console.log("Module: " + moduleType);
        return true;
    } else {
        return false;
    }
  });
});


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
  eval("(" + this.type + '_functions.check' + ")")(this, options);

  /*  That much maligned eval replaces a switch statement with a case for each
      project type that needs adding to for each new type to be supported.

      switch (this.type) {
          case 'github':
            github_functions.check(this, options);
            break;
          case 'sourceforge':
            sourceforge_functions.check(this, options);
            break;
          case ....
          case ....
          case ....
          case ....
          case ....
          case ....
          default;
      }

      Instead, the eval enables new module files to be used just by placing them in one
      of the recognised plugin directories.
  */
}


/* ex:set ai shiftwidth=2 inputtab=spaces smarttab noautotab: */

