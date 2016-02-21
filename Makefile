.PHONY: all install test docker

IMAGE ?= plugins/drone-artifactory

all: install test

install:
	npm install --quiet

test:
	npm test

docker:
	docker build --rm -t $(IMAGE) .
