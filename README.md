## PVC, a Program Version Checker

_**Overview.**_
_PVC_ is a command line driven asynchronous Project Version Checker. It enables checking of the latest versions of various software projects that may be held at different repositories e.g. github, sourceforge, pypi, etc. In addition to built in support for a range of such common public repositories, support for additional repos may be added by the user via a plugin system.

_**What is asynchronous about it?**_ For any list of software projects being tracked, instead of working through the list and connecting one at a time to each of the relevant repositories, _PVC_ opens connections to all the repos at the same time. If each network query to a repo takes, say, 3 seconds to return a result then a sequential iteration through a list of, say, 20 projects would take about 60 seconds to complete. On the other hand the asynchronous approach entails connecting to all 20 repos at the same time and all results are returned in about 3 seconds. In case that sounds too good to be true, let's say 5 seconds.

A caveat on this huge improvement is the case where a project hosted at GitHub has had many, many releases. These releases are returned in 'pages' of 30 releases per page. There's no hold up for projects with fewer than 30 releases but for more than 30 releases, additional connections (one for each page) are required. This means that a project that has had, say, 250 releases will need 9 connections. The catch is that these connections should be sequential resulting in a delay of approximately 27 seconds until all the results have been retrieved. Fortunately projects with so many releases are not common.

_**What's so good about the plugin system?**_ Different repository types (github, sourceforge, etc.) are represented in _PVC_ by module files, one for each supported repo. The format of these module files is fairly constant with relatively minor differences between them. It should be quite easy to adapt any of them to [create new module files](ModuleTutorial.md) to support additional repository types. However if _PVC_ is installed as a system application (rather than having just pulled it down into your own user directory space), the 'ordinary' user wouldn't normally be able to install it in the system directory holding the existing module files. To deal with this problem, _PVC_ recognises a particular directory within the user's part of the file system into which any new module files can be installed. At runtime, _PVC_ loads these additional module files, thereby adding support for new repository types.

Of course any new module files for repository types that might be widely used are welcome to be contributed for inclusion as one of _PVC_'s built in modules. A pull request would be a good mechanism for this sort of contribution. For more details about supporting new repository types, see the [module tutorial](ModuleTutorial.md)

_**Installation.**_
_PVC_ is a Node.js based application so install that first.

_PVC_ can be run directly from either the directory which is created when the download tarball is unpacked or from the directory created when cloning the _pvc_ Github repository. However it is generally more convenient to do a system wide installation as follows: change to the unpacked tarball or clone directory and run `sudo make install` (or plain `make install` if already running as root). 

If you really want to just run _pvc_ privately (from tarball or clone directory), cd to that directory and run `make nodeModules`. To then run _pvc_, you'll always have to cd to that directory and reference the _pvc_ executable in that directory using the dot-slash notation i.e. `./pvc [options] [command]`

