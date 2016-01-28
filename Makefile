.PHONY: install test docker

IMAGE ?= plugins/drone-nuget

install:
	npm install

test:
	@echo "Currently we don't provide test cases!"

docker:
	docker build --rm -t $(IMAGE) .
