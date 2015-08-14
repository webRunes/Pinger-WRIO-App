FROM ubuntu:15.04
MAINTAINER denso.ffff@gmail.com

RUN apt-get update && apt-get install -y nodejs npm mc libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++ git

RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN npm install -g browserify gulp nodemon
RUN mkdir -p /srv/www


# Titter

COPY package.json /srv/package.json
RUN cd /srv/ && npm install # packages are installed globally to not modify titter directory
COPY . /srv/www/


EXPOSE 5001
CMD cd /srv/www/ && rm -fr node_modules && \
    nodemon server.js