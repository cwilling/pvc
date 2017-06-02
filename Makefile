PVC_FILES = pvc \
	pvcCommon.js \
	pvcWatcher-freedesktop.js \
	pvcWatcher-github.js \
	pvcWatcher-hackage.js \
	pvcWatcher-libreoffice.js \
	pvcWatcher-live555.js \
	pvcWatcher-metacpan.js \
	pvcWatcher-pypi.js \
	pvcWatcher-sbdirectlinks.js \
	pvcWatcher-sourceforge.js \
	pvcWatcher-suitesparse.js \
	pvcWatcher-vtk.js \
	pvcWatcher-zpaq.js \
	pvcWatcher.js

DESTDIR ?= "/"
INSTALL_DIR ?= "/usr/share/pvc"
PVC_VERSION ?= $(shell git tag -l | tail -1)

default: install


install: nodeModules $(PVC_FILES) pvc.1 pvc-wrapper
	mkdir -p $(DESTDIR)$(INSTALL_DIR)/node_modules
	mkdir -p $(DESTDIR)/usr/bin
	cp -a $(PVC_FILES) node_modules $(DESTDIR)$(INSTALL_DIR)
	sed -e "s:%INSTALL_DIR%:$(INSTALL_DIR):" pvc-wrapper >$(DESTDIR)/usr/bin/pvc
	mkdir -p $(DESTDIR)/usr/man/man1
	gzip -9c pvc.1 > $(DESTDIR)/usr/man/man1/pvc.1.gz

pvc.1: pvc.1.in
	sed -e 's/@VERSION@/$(PVC_VERSION)/' -e 's/@DATE@/$(shell date +"%a %d %b, %Y")/' $< > $@

# Force manpage update with new version & date
man:
	sed -e 's/@VERSION@/$(PVC_VERSION)/' -e 's/@DATE@/$(shell date +"%a %d %b, %Y")/' pvc.1.in > pvc.1


nodeModules:
	npm install

uninstall:
	rm $(PVC_FILES) $(DESTDIR)$(INSTALL_DIR)
	rmdir --ignore-fail-on-non-empty $(PVC_FILES) $(DESTDIR)$(INSTALL_DIR)

.PHONY:	man nodeModules install uninstall

