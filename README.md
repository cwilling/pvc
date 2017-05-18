## Welcome to PVC, a Program Version Checker

_PVC_ is a command line driven asynchronous Project Version Checker. It enables checking of the latest versions of various software projects that may be held at different repositories e.g. github, sourceforge, pypi, etc. In addition to built in support for a range of such common public repositories, support for additional repos may be added by the user via a plugin system.

_**What is asynchronous about it?**_ For any list of software projects being tracked, instead of working through the list and connecting one at a time to each of the relevant repositories, _PVC_ opens connections to all the repos at the same time. If each network query to a repo takes, say, 3 seconds to return a result then a sequential iteration through a list of, say, 20 projects would take about 60 seconds to complete. On the other hand the asynchronous approach entails connecting to all 20 repos at the same time and all results are returned in about 3 seconds. In case that sounds too good to be true, let's say 5 seconds.

A caveat on this huge improvement is the case where a project hosted at GitHub has had many, many releases. These releases are returned in 'pages' of 30 releases per page. There's no hold up for projects with fewer than 30 releases but for more than 30 releases, additional connections (one for each page) are required. This means that a project that has had, say, 250 releases will need 9 connections. The catch is that these connections should be sequential resulting in a delay of approximately 27 seconds until all the results have been retrieved. Fortunately projects with so many releases are not common.

_**What's so good about the plugin system?**_ Different repository types (github, sourceforge, etc.) are represented in _PVC_ by module files, one for each supported repo. The format of these module files is fairly constant with relatively minor differences between them. It should be quite easy to adapt any of them to [create new module files](#writing-new-module-files) to support additional repository types. However if _PVC_ is installed as a system application (rather than having just pulled it down into your own user directory space), the 'ordinary' user wouldn't normally be able to install it in the system directory holding the existing module files. To deal with this problem, _PVC_ recognises a particular directory within the user's part of the file system into which any new module files can be installed. At runtime, _PVC_ loads these additional module files, thereby adding support for new repository types.

Of course any new module files for repository types that might be widely used are welcome to be contributed for inclusion as one of _PVC_'s built in modules. A pull request would be a good mechanism for this sort of contribution.

### Markdown

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```








For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/cwilling/pvc/settings). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://help.github.com/categories/github-pages-basics/) or [contact support](https://github.com/contact) and we’ll help you sort it out.





## Writing new module files

chjaskhcac cjkxljc


### Example 1: vlc

The video player _vlc_ is devloped and distributed from [http://www.videolan.org/](http://www.videolan.org/). VideoLAN develop and distribute some other software and we will later develop a module to deal with them too. For now, we'll treat this as a case where the repository distributes a single product. We'll choose the name "vlc" as the repo type for this module so the name of the module file will therefore be _pvcWatcher-vlc.js_.

Some searching around the site will lead to a release archive at [http://download.videolan.org/pub/videolan/vlc/](http://download.videolan.org/pub/videolan/vlc/) which contains a list of directories, each named after a particular release version. This makes an excellent starting point; the new module should be able to extract the version numbers fairly easily. We need to see the actual text behind the displayed web page since that is what our module will be dealing with. Run:
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

First find the file _template-pvcWatcher-newtype.js_ and copy it with a new name to the directory ~/.local/share/pvc/. Open the new file with the editor of your choice. Note that there are 4 parts of the file where lines begin with `//!!!!` which indicate the items that need to be edited. The first item is setting the _reqpath_ variable; this is the last part of the url used previously for the _wget_ command above, in this case `pub/videolan/vlc/`. Therefore change the existing _reqpath_ definition to:
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

