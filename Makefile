.PHONY: install test docker

IMAGE ?= plugins/drone-artifactory

install:
	npm install --quiet

test:
	npm test

docker:
	docker build --rm -t $(IMAGE) .
