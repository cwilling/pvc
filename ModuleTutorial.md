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


Read this [tutorial example](ModuleTutorialExample_p1.md) for step by step details about creating a module file for _PVC_ to support a new repository type.

