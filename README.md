**PVC** is a command line driven asynchronous Project Version Checker. It enables checking of the latest versions of various software projects that may be held at different repositories e.g. github, sourceforge, pypi, etc.

PVC maintains a "watch list" of software projects which may be manipulated using the commands summarised below. Any or all of the projects can be queried for their version status using the *list* and *show* commands (for "local" status) and the *check* command for the latest online status of the project(s). This provides a simple mechanism to determine whether any of a number of upstream sources has released a new version.

A project of interest is added to the watch list using pvc's *add* command; removed from the list with the *delete* command. The *add* command needs to be supplied with a project name, a repository type and a url base.
  - the project name is chosen arbitrarily by the user but is likely to reflect the actual project name.
  - the repo type is any of the supported repository types which currently are *github*, *sourceforge*, *pypi*, *hackage*, *live555*, *suitesparse*, *vtk* and *libreoffice*. PVC is designed to enable additional types to be added fairly painlessly.
  - the form of the url base required by the *add* command depends on the repo type:
    - github form is *owner/project name* e.g. cwilling/pvc
    - sourceforge form is *project name/(sub)project name* e.g. qwt/qwt or libvncserver/x11vnc
    - pypi form is simply the *project name* e.g. Cython
    - hackage form is also the *project name* e.g. hscolour
    - libreoffice form is the release category e.g. libreoffice-fresh or libreoffice-still
    - live555 form is the *project name* i.e. live555
    - suitesparse form is the *project name* i.e. suitesparse
    - vtk form is the *project name* i.e. vtk

Examples of *add* command usage for the different repo types are:
  - pvc add --project pvc --type github --urlbase cwilling/pvc
  - pvc add --project x11vnc --type sourceforge --urlbase libvncserver/x11vnc
  - pvc add --project cython --type pypi --urlbase Cython
  - pvc add --project hscolour --type hackage --urlbase hscolor
  - pvc add --project LibreOffice --type libreoffice --urlbase libreoffice-fresh
  - pvc add --project live555 --type live555 --urlbase live555
  - pvc add --project suitesparse --type suitesparse --urlbase suitesparse
  - pvc add --project vtk --type vtk --urlbase vtk

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

If pvc is run without any command, an abbreviated version of the following command summary is shown.

#### Command summary
PVC requires a command and possibly, depending on the command, command related option arguments i.e.
- pvc < command [ command options ] >

In particular:
- pvc list
- pvc show   [ --project projectname ]
- pvc check  [ --project projectname ]
- pvc update < --project projectname > [ --version version ]
- pvc add    < --project projectname --type repotype --urlbase urlbase >
- pvc delete < --project projectname >
- pvc config [ --add item | --delete item | --show [item] ]

where a *config* item consists of a repo type field, optionally followed by further comma separated fields containing key:value pairs.
