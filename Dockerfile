FROM michbil/wrio:latest
MAINTAINER denso.ffff@gmail.com

# Titter

# quick fix for docker and npm3 compatibility

RUN cd $(npm root -g)/npm \
 && npm install fs-extra \
 && sed -i -e s/graceful-fs/fs-extra/ -e s/fs\.rename/fs.move/ ./lib/utils/rename.js

COPY package.json /srv/package.json
RUN cd /srv/ && npm install # packages are installed globally to not modify titter directory
COPY . /srv/www/


EXPOSE 5001
CMD cd /srv/www/ && rm -fr node_modules && \
    gulp watch