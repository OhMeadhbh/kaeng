# Makefile

MODULES = node-props http-proxy

default : ./node_modules

clean : 
	rm -rf ./node_modules

./node_modules :
	mkdir ./node_modules
	npm install $(MODULES)

install-deb :
	cp conf/kaeng /etc/init.d/kaeng
	mkdir -p /opt/kaeng
	cp -R * /opt/kaeng
	update-rc.d kaeng defaults
