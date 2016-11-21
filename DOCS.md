Use this plugin to publish artifacts from the build to Artifactory.
You can override the default configuration with the following parameters:

* `url` - Artifactory URL (Includes scheme)
* `username` - Artifactory username, default to blank
* `password` - Artifactory password, default to blank
* `pom` - An optional pom.xml path were to read project details
* `group_id` - Project group id, default to value from Pom file
* `artifact_id` - Project artifact id, default to value from Pom file
* `version` - Artifact version, default to value from Pom file
* `repo_key` - Target repository key, default to 'libs-snapshot-local' if version contains 'snapshot', 'libs-release-local' otherwise
* `files` - List of files to deploy
* `force_upload` - Force upload if a file already exists

All file paths must be relative to current project sources

File paths are interpreted with [node-glob](https://github.com/isaacs/node-glob#glob-primer) and can contain things such as regex, or directory wildcards(./\*\*/\*.js)

## Secrets

The following secret values can be set to configure the plugin.

* **ARTIFACTORY_URL** - corresponds to **url**
* **ARTIFACTORY_USERNAME** - corresponds to **username**
* **ARTIFACTORY_PASSWORD** - corresponds to **password**

It is highly recommended to put the **ARTIFACTORY_USERNAME** and **ARTIFACTORY_PASSWORD**
into secrets so it is not exposed to users. This can be done using the drone-cli.

```bash
drone secret add --image=athieriot/artifactory \
    octocat/hello-world ARTIFACTORY_USERNAME kevinbacon

drone secret add --image=athieriot/artifactory \
    octocat/hello-world ARTIFACTORY_PASSWORD pa55word
```

Then sign the YAML file after all secrets are added.

```bash
drone sign octocat/hello-world
```

See [secrets](http://readme.drone.io/0.5/usage/secrets/) for additional
information on secrets

## Example

The following is a sample configuration in your .drone.yml file:

```yaml
pipeline:
  artifactory:
    image: athieriot/artifactory
    url: http://arti.company.com
    username: admin
    pom: pom.xml
    repo_key: libs-snapshot-local
    files:
      - target/*.jar
      - target/*.war
      - dist/**/*.min.js
```

## pom.xml deployment

If a pom parameter is specified it will be automatically deployed. It is not necessary to specify the pom under the files parameter.

In the example above, pom.xml will be deployed as ```<groupId>-<artifactId>-<version>.pom```
