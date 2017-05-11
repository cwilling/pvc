PVC is a command line driven Project Version Checker. It enables checking of the latest versions of various software projects that may be held at different repositories e.g. github, sourceforge, pypi, etc.

Software projects are added using pvc's *add* command.

# Command summary
- pvc [ command ]
- pvc list
- pvc show   [ --project projectname ]
- pvc check  [ --project projectname ]
- pvc update < --project projectname >
- pvc add    < --project projectname --type repotype --urlbase urlbase >
- pvc delete < --project projectname >
- pvc config [ --add item | --delete item | --show [item] ]
