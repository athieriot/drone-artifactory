# Docker image for the Drone Artifactory plugin

FROM alpine:3.3

RUN apk update && \
    apk add 'nodejs>4.2.4' && \
    rm -rf /var/cache/apk/*

WORKDIR /bin

COPY package.json /bin/
RUN npm install
COPY . /bin/

ENTRYPOINT [ "node", "index.js" ]
