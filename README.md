This branch contains the files needed to generate a PVC package, suitable for installation into a Slackware Linux operating system.

It is assumed that you have either:
1. cloned the PVC repo from Github and checked out the _slackbuild_ branch
2. downloaded _pvc.slackbuild.tar.gz_ from the _releases_ tab of the PVC Github repository and unpacked it (`tar xf pvc.slackbuild.tar.gz`)

You should therefore have this _README.md_ in your current directory, as well as another directory named _pvc.slackbuild_. Change directory into the _pvc.slackbuild_ directory where there should be four files including _pvc.info_. Use the DOWNLOAD url in _pvc.info_ to download the correct version source tarball, something like:

    wget https://github.com/cwilling/pvc/archive/0.7.6/pvc-0.7.6.tar.gz

Now build the package with:

    sudo sh pvc.SlackBuild
which builds the package and deposits it in /tmp, from where it may be installed with something like (again, depending on version):

    sudo /sbin/installpkg /tmp/pvc-0.7.6-x86_64-1_SBo.tgz

If upgrading from a previous version, install the new package with something like:

    sudo PATH=/sbin:$PATH /sbin/upgradepkg /tmp/pvc-0.7.6-x86_64-1_SBo.tgz


Have fun!
