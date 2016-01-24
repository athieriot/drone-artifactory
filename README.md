# drone-artifactory

Drone plugin for sending artifacts to artifactory

# Usage

        node index.js <<EOF
        {
            "repo": {
                "clone_url": "git://github.com/drone/drone",
                "full_name": "drone/drone"
            },
            "build": {
                "number": 1,
                "event": "push",
                "branch": "master",
                "commit": "436b7a6e2abaddfd35740527353e78a227ddcb2c",
                "ref": "refs/heads/master",
                "status": "success"
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

# Docker

Build the Docker container:

    docker build -t drone-plugin/drone-artifactory .
