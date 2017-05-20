This tutorial example of how to create a new module file for _PVC_ has three parts.

- Part 1 introduces the simplest type of repository, a site hosting a single software project.
- Part 2 shows how to modify the module file created in Part 1 to support multiple projects at a single site
- Part 3 suggests strategies to deal with possible inconsistencies in a site's presentation of its data


### Part 1. A single project repo

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


### Part 2. A multi project repo

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

## Part 3. Repository quirks

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

Our next task is to work out how to extract the version string from a line of data for each of the _x264_ and _x265_ cases. Use _wget_ to obtain the complete data for the _x264_ case; run:
```
 wget https://download.videolan.org/pub/videolan/x264/snapshots/   
```
Examining the resulting _index.html_ file reveals links to tarballs with names like `x264-snapshot-XXXXXXXX-YYYY.tar.bz2` where XXXXXXXX-YYYY is a datestamp that is used for versioning. Later tarballs have duplicate versions with slightly different names of the form `x264-snapshot-XXXXXXXX-YYYY-stable.tar.bz2`. Since we're only interested in the latest version anyway, we'll use this latter name format to extract the version string. The tarball names sit between `>` and `<` characters so a good overall strategy would be to look for lines containing `stable.tar.bz2<` and for those lines remove all text up to and including `>x264-snapshot-` as well all text from and following `-stable.tar.bz2<`. Test it first at the _node_ command line like this:
```
    var line = '<a href="x264-snapshot-20170518-2245-stable.tar.bz2">x264-snapshot-20170518-2245-stable.tar.bz2</a>'
```
then search for `-stable.tar.bz2<` with:
```
    line.search(/-stable\.tar\.bz2</);
```
which will return a number greater than 0 if the search string is found.
Now test removal of everything up to the datestamp with:
```
    line.replace(/.*x264-snapshot-/,"");
```
which should return the datestamp and remainder of the line. Now add to the previous regular expression to remove everything after the datestamp with:
```
    line.replace(/.*x264-snapshot-|-stable\.tar\.bz2<.*/g,"");
```
which returns just the datestamp. We can be confident that these search and replace regular expressions can be used for the _x264_ case, which would now look something like:
```
    case 'x264':
      if (rawVersion.search(/-stable\.tar\.bz2</) > 0 ) {
          return rawVersion.replace(/^.*>x264-snapshot-|-stable\.tar\.bz2<.*/g, "");
      }
      break;
```
We now go through a simlar process for the _x265_ case. Remove any existing `index.html` file and then run:
```
     wget https://download.videolan.org/pub/videolan/x265/
```
The resulting `index.html` file shows a list of lines beginning:
```
    <a href="x265_2.1.tar.gz">x265_2.1.tar.gz</a>
```
These line will be identifiable by searching for lines containing `>x265_` followed by some numbers and dots, followed by `.tar.gz<` and, having matched that, remove the leading `>x265_` and trailing `.tar.gz<` from the match. Testing this with the _node_ command line:


The _x265_ case statement should therefore look something like:
