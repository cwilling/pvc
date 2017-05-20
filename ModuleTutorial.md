### Writing new module files to support new repository types

Although the range of repositories already supported by _PVC_'s built in modules may be sufficient for most needs, it's quite possible that additional repository support is needed. This is possible at the user level i.e. without integration into the main _PVC_ application, by the creation of new module files to support other repository types. A repository type is just a label to denote how a particular repository presents its data. GitHub presents its data differently to Sourceforge so we give them different type labels: _github_ and _sourceforge_ respectively. Many repositories host multiple projects and, for purposes of network access, we distinguish between them by a _urlbase_ which is generally the minimum part of the project's url that is needed to distinguish that project from other projects at the same repository. Consider these three project urls:
```
    https://github.com/OpenShot/openshot-qt
    https://github.com/OpenShot/libopenshot
    https://github.com/cwilling/pvc
```
They all have in common the protocol and host parts of the url, namely `https://github.com/`. The projects are distinguished by the part of the url immediately following, namely `OpenShot/openshot-qt`, `OpenShot/libopenshot` and `cwilling/pvc`. The distinguishing parts of the url are used as the _urlbase_ for these projects by _PVC_.

Some repositories host only a single project and therefore don't need to be distinguished from others. In such cases the _urlbase_ is actually superfluous, although it is still needed by _PVC_ itself due to the way command arguments are currently processed.

The main task in implementing a module file for a new repository type is to provide a function _check(parent, option)_ which, using information via the _parent_ and _options_ parameters, downloads whatever data is required from the repository, extracts version numbers from the data, then sorts them and provides the latest of them by emiting a signal whose type depends on the action with which the _check()_ function was called (_validate_, _check_, or _update_). Most of this is boilerplate code available in a template, the most complex task being to extract the version numbers; even that is often completed in half a dozen lines of code (see _vlc_ example below).

User generated module files Have a strict naming convention and must be installed in a particular directory in the user's part of the file system, _~/.local/share/pvc_. If that directory doesn't yet exist it can be created manually (_mkdir_) or by running the _pvc_ command itself, which creates the directory for its own use. The name of the module file must be:
```
    pvcWatcher-XXXX.js
```
where XXXX is a string of any length representing the new _type_ which the module file supports. For example, a module file for a new _boaconstrictor_  repository type would be named:
```
    pvcWatcher-boaconstrictor.js
```


More to come ....


See the [example](ModuleTutorialExample_p1.md) for step by step details on creating a module file for _PVC_ to support a new repository type.

### Example 1. A single project repo

The video player _vlc_ is devloped and distributed from [http://www.videolan.org/](http://www.videolan.org/). VideoLAN develop and distribute some other software and we will later develop a module to deal with them too. For now, we'll treat this as a case where the repository distributes a single product. We'll choose the name "vlc" as the repo type for this module so the name of the module file will therefore be _pvcWatcher-vlc.js_.

Some searching around the VideoLAN web site will lead to a release archive at [http://download.videolan.org/pub/videolan/vlc/](http://download.videolan.org/pub/videolan/vlc/) which contains a list of directories, each named after a particular release version. This makes an excellent starting point; the new module should be able to extract the version numbers fairly easily. We need to see the actual text behind the displayed web page since that is what our module will be dealing with. Run:
```
    wget http://download.videolan.org/pub/videolan/vlc/
```
This will leave a file named _index.html_ in your current directory. Examine the file with _less_, or whatever tool you like, and you'll see that it's made up of a number of lines beginning with
```html
    <a href="0.1.99/">0.1.99/</a>
    <a href="0.1.99a/">0.1.99a/</a>
    ...,
    <a href="2.2.4/">2.2.4/</a>
    <a href="2.2.5/">2.2.5/</a>
    <a href="2.2.5.1/">2.2.5.1/</a>
    etc
```
The version numbers are clearly visible twice per entry. We could extract the second instance in each line with a regular expression targeting any collection of numbers and dots (but beginning with a number) bounded at the start with a ">" character and at the end with a "/" character. Before proceeding to code it up, I usually try to figure out the required regex using _node_ at the command line. At node's prompt, enter
```
    var str = '<a href="2.2.5.1/">2.2.5.1/</a>';
```
which is the first part of one of the lines. Now we can try various regexps using the match function e.g.
```
    var matched = str.match(/>[0-9][0-9.]*\//);
```
This returns an array named _matched_ whose first element contains whatever has been matched, in this case `'>2.2.5.1/'`. We can remove the leading ">" with:
```
    matched[0].replace(/^>/,"");
```
which returns `'2.2.5.1/'` and we could then add another _replace()_ to remove the trailing "/" with:
```
    matched[0].replace(/^>/,"").replace(/\/$/,"");
```
returning the clean version number string `2.2.5.1`. We could also combine the two replacement regexps into one by using:
```
    matched[0].replace(/^>|\/$/g,"");
```
Our code strategy is now pretty clear: download the current listing of versions and extract the version number from each line into an array which we then then sort to determine the newest available version.

First find the file _template-pvcWatcher-newtype.js_ and copy it with a new name to the directory ~/.local/share/pvc/. The new module's filename should be _pvcWatcher-vlc.js_. Open the new file with the editor of your choice. Note that there are 4 parts of the file where lines begin with `//!!!!` which indicate the items that need to be edited. The first item is setting the _reqpath_ variable; this is the last part of the url used previously for the _wget_ command above, in this case `pub/videolan/vlc/`. Therefore change the existing _reqpath_ definition to:
```
    var reqpath = 'pub/videolan/vlc/';
```

The next item to set is the host name. Change the host definition line to:
```
    host: 'download.videolan.org',
```

Now skip to the last item, renaming the _template\_functions_  object (to _vlc\_functions_). Change its declaration line to:
```
    vlc_functions = {
```

Lets return to the item where we extract the version number, labelled _Process res_data here, leaving version numbers in versions[]_. The requested data has been downloaded as a stream of bytes which is now available to us as _res_data_. We convert that data into an array of lines by adding:
```
    res_data = res_data.split(/\r?\n/);
```

We now need to loop through all the available lines trying to match potential version strings just as we did above at the _node_ command line. For any matches that we find, we remove extraneous leading and trailing characters and add the clean version string to the already declared _versions_ array. Do this by adding:
```
    for (var i=0;i<res_data.length;i++) {
       //console.log(res_data[i]);
       var matched = res_data[i].match(/>[0-9][0-9.]*\//);
       if (matched) {
           //console.log("matched = " + matched[0]);
           versions.push(matched[0].replace(/^>|\/$/g,""));
       }
    }
```    

All having gone well, the new module file is ready to go so save it and exit the editor. To check that the new module is recognised, run:
```
    pvc config
```

which should now show _vlc_ in the list of available retrieval types. If so, a new _vlc_ project can be added to _pvc_'s watch list with:
```
    pvc add --project vlc --type vlc --urlbase vlc
```
On completion, _pcv_ should display something like `NOTE: latest version is 2.2.5.1`, depending on whatever the latest version actually is. If it instead responds with `NOTE: latest version is undefined`, then something has gone wrong and it's time to start debugging ...


### Example 2. A multi project repo

Many repositories host multiple projects e.g. github, sourceforge, pypi etc., and these can generally be supported by a single module file. Recall that although we developed [Example 1](#example-1.-a-single-project-repo) as a single project repository, the VideoLAN site actually hosts a number of projects. These can be seen as a directory listing with an ordinary browser at [https://download.videolan.org/pub/videolan/](https://download.videolan.org/pub/videolan/). Conveniently, the layout within those different project directories mostly is similar to that in the _vlc_ directory which we've already coded for. The _urlbase_ was not needed in the first example since all the relevant information for the single project being addressed existed in a single directory. However if we made a module file for a new _videolan_ type where the _reqpath_ could be set according the value of the _urlbase_, we would have a mechanism to query any of the VideoLAN hosted projects.

In ~/.local/share/pvc directory, change the name of the file _pvcWatcher-vlc.js_ to _pvcWatcher-videolan.js_. Now open it with an editor and find the line where  _reqpath_ is declared and change it to:
```
    var reqpath = 'pub/videolan/' + parent.urlpath + '/';
```

Near the end of the file, change the `vlc_functions` object declaration line to:
```
    videolan_functions = {
```
Save the file and exit the editor. To check that the new module file is recognised by _PVC_, run the command:
```
   pvc config
```
The output should include `videolan` in its listing of available retrieval types. If there remains an earlier addition of the _vlc_ project using the _vlc_ repo type of [Example 1](#example-1.-a-single-project-repo), remove it with:
```
    pvc delete --project vlc
```
Now try adding the _vlc_ project again, this time using the new _videolan_ repo type with the command:
```
    pvc add --project vlc --type videolan --urlbase vlc
```
It should report `NOTE: latest version is 2.2.5.1` (or whatever the latest version is at the time). Now try adding another project from the same repository e.g.
```
    pvc add --project libbluray --type videolan --urlbase libbluray
```
whose output should include `NOTE: latest version is 1.0.0` (or whatever).

## Example 3. Repo quirks

Sometimes it is necessary to deal with inconsistent presentation of the project data by the repository. The VideoLAN projects generally follow the pattern of providing a list of the different versions of a project, naming each directory after the version they represent e.g. `0.3.0, 0.3.1, 0.3.2, .....`. It's this consistency that make it relatively easy to deal with VideoLAN's multiple projects. However, navigate with a browser to the the _x265_ project directory where, instead of a list of version directories, is a collection of tarballs. Even worse, the _x264_ project directory requires navigation to another _snapshots_ directory before a list of tarball links is found here too.

Assuming that the different directory levels for the _x264_ project is unusual, it can be dealt fairly simply when we set the request path by changing the line:
```
    var reqpath = 'pub/videolan/' + parent.urlbase + '/';
```
to:
```
    if (parent.urlbase == 'x264') {
      var reqpath = 'pub/videolan/' + parent.urlbase + '/snapshots/';
    } else {
      var reqpath = 'pub/videolan/' + parent.urlbase + '/';
    }
```

To deal with different numbering conventions, be they directory names, tarball names etc., we can use different regular expressions to extract version strings depending on the name of the project i.e. _x264_ project files will need a different regexp to the _x265_ files. Over time, there may further cases requiring similar treatment so, rather than clutter the main _check()_ function with all possible cases, we can pass this work off to a new function which will deal with the special cases to correctly extract the version string and return it to _check()_ for addition to the _versions_ array, as before.

In the new _pvcWatcher-videolan.js_ file from around line 34, change the existing version extraction loop from:
```
      for (var i=0;i<res_data.length;i++) {
        //console.log(res_data[i]);
        var matched = res_data[i].match(/>[0-9][0-9.]*\//);
        if (matched) {
          //console.log("matched = " + matched[0]);
          versions.push(matched[0].replace(/^>|\/$/g,""));
        }
      }
```
to:
```
        for (var i=0;i<res_data.length;i++) {
          //console.log(res_data[i]);
          var extracted = extractVersionId(parent.urlbase, res_data[i]);
          if (extracted) {
            //console.log("extracted = " + extracted);
            versions.push(extracted);
          }
        }
```
We'll be calling a new function _extractVersionId(projectId,rawVersion)_, passing it the name of the project directory (via the _parent.urlbase_ parameter) as well as the line of data (via _rawVersion_) from which to extract the version string.

The new version extraction function can consist of just a _switch_ statement which returns the extracted version string depending on the project being dealt with. Additional cases can easily be added later should the need arise. The new function will look something like:
```
function extractVersionId(projectId, rawVersion) {
  switch (projectId) {
    case 'x264':
      return version string extracted specially from format of x264 entries
      break;
    case 'x265':
      return version string extracted specially from format of x265 entries
      break;
    default:
      var matched = rawVersion.match(/>[0-9][0-9.]*\//);
      if (matched) {
        return matched[0].replace(/^>|\/$/g,"");
      }
      break;
  }
```
Note that the default i.e. "not special" case is just the same as the original extraction code in _check()_ before we started considering the differing presentations of the _x264_ and _x265_ project data.
