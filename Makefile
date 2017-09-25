PVC_FILES = pvc \
	pvcWatcher.js

PVC_PLUGIN_FILES = \
	plugins/pvcCommon.js \
	plugins/pvcWatcher-alsa.js \
	plugins/pvcWatcher-freedesktop.js \
	plugins/pvcWatcher-generic.js \
	plugins/pvcWatcher-github.js \
	plugins/pvcWatcher-ghcommits.js \
	plugins/pvcWatcher-gnu.js \
	plugins/pvcWatcher-hackage.js \
	plugins/pvcWatcher-http.js \
	plugins/pvcWatcher-ibiblio.js \
	plugins/pvcWatcher-iisland.js \
	plugins/pvcWatcher-libreoffice.js \
	plugins/pvcWatcher-metacpan.js \
	plugins/pvcWatcher-mirrorservice.js \
	plugins/pvcWatcher-pypi.js \
	plugins/pvcWatcher-samba.js \
	plugins/pvcWatcher-savannah.js \
	plugins/pvcWatcher-sbdirectlinks.js \
	plugins/pvcWatcher-sgi.js \
	plugins/pvcWatcher-sourceforge.js \
	plugins/pvcWatcher-videolan.js \
	plugins/pvcWatcher-xiph.js

PVC_EXTRA_FILES = \
	extra/template-pvcWatcher-newtype.js

DESTDIR ?= "/"
INSTALL_DIR ?= "/usr/share/pvc"
PVC_VERSION ?= $(shell git tag -l | tail -1)

default: install


install: nodeModules $(PVC_FILES) pvc.1 pvc-wrapper
	mkdir -p $(DESTDIR)$(INSTALL_DIR)/{node_modules,plugins,extra}
	mkdir -p $(DESTDIR)/usr/bin
	cp -a $(PVC_FILES) node_modules $(DESTDIR)$(INSTALL_DIR)
	cp -a $(PVC_PLUGIN_FILES) $(DESTDIR)$(INSTALL_DIR)/plugins
	cp -a $(PVC_EXTRA_FILES) $(DESTDIR)$(INSTALL_DIR)/extra
	sed -i -e 's/@PVC_VERSION@/$(PVC_VERSION)/' $(DESTDIR)$(INSTALL_DIR)/pvc
	sed -e "s:%INSTALL_DIR%:$(INSTALL_DIR):" pvc-wrapper >$(DESTDIR)/usr/bin/pvc
	chmod a+x $(DESTDIR)/usr/bin/pvc
	mkdir -p $(DESTDIR)/usr/man/man1
	gzip -9c pvc.1 > $(DESTDIR)/usr/man/man1/pvc.1.gz
	rm -rf node_modules

pvc.1: pvc.1.in
	sed -e 's/@VERSION@/$(PVC_VERSION)/' -e 's/@DATE@/$(shell date +"%a %d %b, %Y")/' $< > $@

# Force manpage update with new version & date
man:
	sed -e 's/@VERSION@/$(PVC_VERSION)/' -e 's/@DATE@/$(shell date +"%a %d %b, %Y")/' pvc.1.in > pvc.1


nodeModules:
	npm install

uninstall:
	rm -rf $(DESTDIR)$(INSTALL_DIR)/*
	rmdir --ignore-fail-on-non-empty $(DESTDIR)$(INSTALL_DIR)
	rm $(DESTDIR)/usr/bin/pvc
	rm $(DESTDIR)/usr/man/man1/pvc.1*

.PHONY:	man nodeModules install uninstall

