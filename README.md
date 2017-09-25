This branch contains the files needed to generate a PVC package, suitable for installation into a Slackware Linux operating system.

It is assumed that you have either:
1. cloned the PVC repo from Gihub and checked out the _slackbuild_ branch
2. downloaded the pvc.slackbuild.tar.gz from the _Releases_ page of the PVC Github repository and unpacked it (`tar xf pvc.slackbuild.tar.gz`)

You should therefore have this README.md in your current directory, as well as another directory named pvc.slackbuild. Change directory into the pvc.slackbuild directory where there should be four files including _pvc.info_. Use the DOWNLOAD url in _pvc.info_ to download the correct source tarball, something (depending on the version) like:

    wget https://github.com/cwilling/pvc/archive/0.7.6/pvc-0.7.6.tar.gz

Now build the package with:

    sudo sh pvc.SlackBuild
which builds and deposits the package in /tmp, from where it may be installed with something like (again, depending on version):

    sudo /sbin/installpkg /tmp/pvc-0.7.6-x86_64-1_SBo.tgz

If upgrading from a previous version, install the new package with something like:

    sudo PATH=/sbin:$PATH /sbin/upgradepkg pvc-0.7.6-x86_64-1_SBo.tgz


Have fun!
