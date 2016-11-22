# drone-artifactory

[![Build Status](http://beta.drone.io/api/badges/athieriot/drone-artifactory/status.svg)](http://beta.drone.io/athieriot/drone-artifactory)
[![Coverage Status](https://aircover.co/badges/athieriot/drone-artifactory/coverage.svg)](https://aircover.co/athieriot/drone-artifactory)
[![](https://images.microbadger.com/badges/image/athieriot/drone-artifactory.svg)](https://microbadger.com/images/athieriot/drone-artifactory "Get your own image badge on microbadger.com")

Drone plugin to publish files and artifacts to Artifactory. For the usage information and a listing of the available options please take a look at [the docs](DOCS.md).

## Execute

Install the deps using `make`:

```
make install
```

### Example

```sh
npm start <<EOF
{
    "repo": {
        "clone_url": "git://github.com/drone/drone",
        "owner": "drone",
        "name": "drone",
        "full_name": "drone/drone"
    },
    "system": {
        "link_url": "https://beta.drone.io"
    },
    "build": {
        "number": 22,
        "status": "success",
        "started_at": 1421029603,
        "finished_at": 1421029813,
        "message": "Update the Readme",
        "author": "johnsmith",
        "author_email": "john.smith@gmail.com"
        "event": "push",
        "branch": "master",
        "commit": "436b7a6e2abaddfd35740527353e78a227ddcb2c",
        "ref": "refs/heads/master"
    },
    "workspace": {
        "root": "/drone/src",
        "path": "/drone/src/github.com/drone/drone"
    },
    "vargs": {
        "url": "http://arti.company.com",
        "username": "username",
        "password": "password",
        "repo_key": "libs-snapshot-local",
        "pom": "pom.xml",
        "files": [
            "pom.xml",
            "target/*.jar",
            "target/*.war"
        ]
    }
}
EOF
```

## Docker

Build the container using `make`:

```
make docker
```

### Example

```sh
docker run -i plugins/drone-artifactory <<EOF
{
    "repo": {
        "clone_url": "git://github.com/drone/drone",
        "owner": "drone",
        "name": "drone",
        "full_name": "drone/drone"
    },
    "system": {
        "link_url": "https://beta.drone.io"
    },
    "build": {
        "number": 22,
        "status": "success",
        "started_at": 1421029603,
        "finished_at": 1421029813,
        "message": "Update the Readme",
        "author": "johnsmith",
        "author_email": "john.smith@gmail.com"
        "event": "push",
        "branch": "master",
        "commit": "436b7a6e2abaddfd35740527353e78a227ddcb2c",
        "ref": "refs/heads/master"
    },
    "workspace": {
        "root": "/drone/src",
        "path": "/drone/src/github.com/drone/drone"
    },
    "vargs": {
        "url": "http://arti.company.com",
        "username": "username",
        "password": "password",
        "repo_key": "libs-snapshot-local",
        "pom": "pom.xml",
        "files": [
            "pom.xml",
            "target/*.jar",
            "target/*.war"
        ]
    }
}
EOF
```
