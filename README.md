**PVC** is a command line driven Project Version Checker. It enables checking of the latest versions of various software projects that may be held at different repositories e.g. github, sourceforge, pypi, etc.

PVC maintains a "watch list" of software projects which may be manipulated using the commands summarised below. Any or all of the projects can be queried for their version status using the *list* and *show* commands (for "local" status) and the *check* command for the latest online status of the project(s). This provides a simple mechanism to determine whether any of a number of upstream sources has released a new version.

A project of interest is added to the watch list using pvc's *add* command; removed from the list with the *delete* command. The *add* command needs to be supplied with a project name, a repository type and a url base.
  - the project name is chosen arbitrarily by the user but is likely the same as the actual project name.
  - the repo type is any of the supported repository types which currently are *github*, *sourceforge*, *pypi* and *libreoffice*. PVC is designed to enable additional types to be added fairly painlessly.
  - the form of the url base required by the *add* command depends on the repo type:
    - github form is *owner/project* e.g. cwilling/pvc
    - sourceforge form is *project/(sub)project* e.g. qwt/qwt or libvncserver/x11vnc
    - pypi form is simply *project* e.g. Cython
    - libreoffice form is just the release category e.g. libreoffice-fresh or libreoffice-still

Examples of *add* command usage for the different repo types are:
  - pvc add --project Hoorex --type gitihub --urlbase cwilling/hoorex
  - pvc add --project x11vnc --type sourceforge --urlbase libvncserver/x11vnc
  - pvc add --project cython --type pypi --urlbase Cython
  - pvc add --project LibreOffice --type libreoffice --urlbase libreoffice-fresh

### Command summary
- pvc [ command ]
- pvc list
- pvc show   [ --project projectname ]
- pvc check  [ --project projectname ]
- pvc update < --project projectname >
- pvc add    < --project projectname --type repotype --urlbase urlbase >
- pvc delete < --project projectname >
- pvc config [ --add item | --delete item | --show [item] ]
