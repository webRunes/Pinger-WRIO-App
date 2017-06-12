FROM mhart/alpine-node:7
MAINTAINER denso.ffff@gmail.com

# Titter
RUN apk add --no-cache \
        git \
        build-base \
        g++ \
        cairo-dev \
        jpeg-dev \
        pango-dev \
        giflib-dev

COPY package.json /srv/package.json
RUN cd /srv/ && npm install # packages are installed globally to not modify titter directory

RUN npm install -g gulp

WORKDIR /srv/www
COPY . /srv/www/
RUN gulp

EXPOSE 5001
CMD cd /srv/www/ && rm -fr node_modules && \
    gulp watch