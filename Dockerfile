FROM alpine:3.3

RUN apk update && \
  apk add \
    ca-certificates \
    nodejs && \
  rm -rf \
    /var/cache/apk/*

WORKDIR /node
ADD package.json /node/
RUN npm install --production

ADD index.js /node/

ENTRYPOINT ["node", "/node/index.js"]
