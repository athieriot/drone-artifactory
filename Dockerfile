# Docker image for the Drone Artifactory plugin

FROM alpine:3.3

RUN apk update && \
    apk add nodejs && \
    rm -rf /var/cache/apk/*

WORKDIR /node

COPY package.json /node/
RUN npm install
COPY . /node/

ENTRYPOINT [ "node", "index.js" ]
