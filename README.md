**PVC** is a command line driven asynchronous Project Version Checker. It enables checking of the latest versions of various software projects that may be held at different repositories e.g. github, sourceforge, pypi, metacpan, etc. In addition to support of a range of such common public repositories, support for additional repos may be added by the user via a plugin system.

PVC maintains a "watch list" of software projects which may be manipulated using the commands summarised below. Any or all of the projects can be queried for their version status using the *list* and *show* commands (for "local" status) and the *check* command for the latest online status of the project(s). This provides a simple mechanism to determine whether any of a number of upstream sources has released a new version.

A project of interest is added to the watch list using pvc's *add* command; removed from the list with the *delete* command. The *add* command needs to be supplied with a project name, a repository type and a url base.
  - the project name is chosen arbitrarily by the user but is likely to reflect the actual project name.
  - the repo type is any of the supported repository types including *github*, *sourceforge*, *pypi*, *freedesktop*, *hackage*, *metacpan* and *libreoffice*. Any built in types may be supplemented with additional user defined types by placing a suitably crafted module file in a prearranged user writable directory, from where it is added at run time (for details,see: [https://cwilling.github.io/pvc/](https://cwilling.github.io/pvc/).
  - the format of the url base required by the *add* command depends on the repo type:
    - github form is *owner/project name* e.g. cwilling/pvc
    - sourceforge form is *project name/(sub)project name* e.g. qwt/qwt or libvncserver/x11vnc
    - sbdirectlinks form is simply the *project name* e.g. leocad
    - pypi form is also just the *project name* e.g. Cython
    - hackage form is also the *project name* e.g. hscolour
    - freedesktop form is the *project name* e.g. libevdev
    - libreoffice form is the release category e.g. libreoffice-fresh or libreoffice-still
    - metacpan form is the *project name (as known at metacpan)* e.g. libnet
    
Examples of *add* command usage for the different repo types are:
  - pvc add --project pvc --type github --urlbase cwilling/pvc
  - pvc add --project x11vnc --type sourceforge --urlbase libvncserver/x11vnc
  - pvc add --project cython --type pypi --urlbase Cython
  - pvc add --project leocad --type sbdirectlinks --urlbase leocad
  - pvc add --project hscolour --type hackage --urlbase hscolor
  - pvc add --project libevdev --type freedesktop --urlbase libevdev
  - pvc add --project LibreOffice --type libreoffice --urlbase libreoffice-fresh
  - pvc add --project perl-libnet --type metacpan --urlbase libnet

A full list of supported repo types is given in response to the command:

    pvc config
    
As the *add* command runs, it interrogates the remote repository for the project's latest version number which is recorded for later reference as well as being displayed at the command line. If the version number displayed is *undefined*, it indicates a failure of the *add* command.

The current contents of the watch list may be viewed at any time using the *list* and *show* commands. The *list* command displays each watched project name and its recorded version number, one project entry per line. The *show* command displays all pvc's information about each watched project. The information that is displayed consists of the project's name, repo type, url base and recorded version number. If a --project argument is supplied, only information about the named project is displayed e.g.

    pvc show --project pvc
    Showing project: pvc
    {
     "project": "pvc",
     "type": "github",
     "urlbase": "cwilling/pvc",
     "version": "0.1.1"
    }
    
The *check* command compares locally recorded version numbers with the latest upstream release versions. The upstream repository of each nominated project is queried for the latest version number and displayed alongside the locally recorded version numer. If the version numbers are the same, pvc displays something like:

    pvc check --project pvc
    Project pvc  = 0.1.1

If the version number has changed, pvc displays something like:

    pvc check --project LibreOffice
    ******* LibreOffice local version = 5.3.2.2 remote version = 5.3.3.2

If a --project argument is supplied to the *check* command, only the nominated project's version is checked. If no --project argument is supplied to the *check* command, all recorded projects are checked and the results diplayed one per line. A nice feature of pvc is that this checking of multple projects is performed asynchronously. Normally, an upstream project query may take 2-3 seconds to complete. Therefore a sequential check of a watch list containing, say, 30 projects will take 60-90 seconds. However pvc's async checking requires only slightly longer than the 2-3 seconds of a single query to complete checking the whole watch list.

The *update* command updates the version number of the project specified with the --project argument. Normally a --version argument is not supplied and pvc will query the upstream repo for the latest available version number. However if a version number is supplied with the --version argument, it will be used instead.

The *config* command is used to record keyword:value style definitions that may be pertinent for queries to a particular repository. The *config* command's --add argument consists of comma separated fields; the first field naming the repo type for the subsequent definitions; the following fields containing the actual keyword:value definitions.

An example is user credential for github queries. Public queries without any user credentials are OK up to some limit, currently 60 per hour; correctly authorised queries are limited to 5000 per hour (see [rate limiting](https://developer.github.com/v3/#rate-limiting)). Github account holders may use their username and password to authenticate. However, since only Basic authentication is implemented, it's probably preferable to generate a [personal access token](https://github.com/blog/1509-personal-api-tokens) dedicated to this use. Such a token can be added to pvc using a command like:

    pvc config --add github,username:cwilling,token:qwerty123

where the first field of the --add argument indicates that github is the repository to which the configuration will be applied, the second field is "username:cwilling" and the third field is "token:qwerty123".

After adding such authorisation with the *config* command, pvc will use it for all access to the github repository.

Since *pvc*'s configuration is available to all modules, it provides a way to supply any extra information that a module may need (like GitHub authorization details, as already described). Another example is the abilty to configure how far through a project's release pages should be searched for the latest version. Some GitHub projects have several pages of releases. If the latest release appears on the first page, there's no point in looking at the remaining pages; each page entails a new query and therefore another 3-4 seconds retrieving each page. That may be OK for just a few pages but there are sometimes many more. For example the vim/vim project has over 192 pages of releases, resulting in a very long time to accumulate all results even though the only result we're actually interested in is on the first page. For such cases, the *github* module recognizes a configuration option named *multipagelimit* and applies it to any project for which it is configured. For the *vim* project, it would be set by:

    pvc config -add vim/vim,multipagelimit:1

which indicates that only the first page of *vim* releases should be consulted. Notice that the project is identified by its *urlbase*, not its project name. Another such example is finding the GitHub's *OpenImage/oiio* latest release, contained on the third of nine pages. In this case we would configure:

    pvc config -add OpenImage/oiio,multipagelimit:3

which indicates that only the first three pages of results should be consulted.

Although these examples involve the *github* type, this mechanism is particularly useful for user defined modules which can be written to look for any configured item the author needs or cares to include.


If pvc is run without any command, an abbreviated version of the following command summary is shown.

#### Command summary
PVC requires a command and possibly, depending on the command, command related option arguments i.e.
- pvc < command [ command options ] >

In particular:
- pvc list
- pvc show   [ -p|--project projectname ]
- pvc check  [ -p|--project projectname ]
- pvc update < -p|--project projectname > [ -v|--version version ]
- pvc add    < -p|--project projectname -t|--type repotype > [ -u|--urlbase urlbase ]
- pvc delete < -p|--project projectname >
- pvc config [ --add item | --delete item | --show [item] ]

where a *config* item consists of a repo type field, optionally followed by further comma separated fields containing key:value pairs.

#### Debugging
In case of problems, all commands accept a -d | --debug option to output additional debugging information e.g.
```
    pvc -d check hoorex
```


#### Installation
See Installation instructions at https://cwilling.github.io/pvc/
