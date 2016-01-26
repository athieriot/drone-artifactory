const Drone = require('drone-node');
const plugin = new Drone.Plugin();

const ArtifactoryAPI = require('artifactory-api');
const pomParser = require("pom-parser");
const shelljs = require("shelljs");

const btoa = require('btoa');
const fs = require('fs');
const path = require('path');

const do_upload = function (workspace, vargs) {
  if (vargs.url && vargs.repo_key) {

    var hash = btoa(vargs.username + ':' + vargs.password)
    var artifactory = new ArtifactoryAPI(vargs.url, hash);

    var resolved_files = [].concat.apply([], vargs.files.map((f) => { return shelljs.ls(workspace.path + '/' + f); }));

    console.log('Project groupId: ' + vargs.group_id);
    console.log('Project artifactId: ' + vargs.artifact_id);
    console.log('Project version: ' + vargs.version);

    resolved_files.forEach((file) => {
      var basename = path.basename(file);

      // Default repo_key to 'libs-snapshot-local' or 'libs-release-local'
      if (!vargs.repo_key) { vargs.version.toLowerCase().indexOf('snapshot') > -1 ? vargs.repo_key = 'libs-snapshot-local' : vargs.repo_key = 'libs-release-local'; }
      if (file.indexOf('pom') > -1) { basename = vargs.artifact_id + '-' + vargs.version + '.pom'; } 

      console.log('Uploading ' + file + ' as ' + basename + ' into ' + vargs.repo_key);
      artifactory.uploadFile(vargs.repo_key, '/' + vargs.group_id + '/' + vargs.artifact_id + '/' + vargs.version + '/' + basename, file, vargs.force_upload)
      .then(function (uploadInfo) {

        console.log('Upload successful. Available at: ' + uploadInfo.downloadUri)
      }).fail(function (err) {

        console.log('An error happened while trying to push the file ' + file + ': ' + err);
      });
    });
  } else {

    console.log("Parameter missing: Artifactory URL or Repository Key");
    process.exit(1)
  }
}

plugin.parse().then((params) => {

  // gets build and repository information for
  // the current running build
  const build = params.build;
  const repo  = params.repo;
  const workspace = params.workspace;

  // gets plugin-specific parameters defined in
  // the .drone.yml file
  const vargs = params.vargs;

  vargs.username      || (vargs.username = '');
  vargs.password      || (vargs.password = '');
  vargs.files         || (vargs.files = []);
  vargs.force_upload  || (vargs.force_upload = false);

  if (vargs.pom) {
    if (!fs.existsSync(workspace.path + '/' + vargs.pom)) {
      console.log('Given pom file has to exists');
      process.exit(2);
    }

    pomParser.parse({ filePath: workspace.path + '/' + vargs.pom }, function(err, pomResponse) {
      if (err) {
        console.log('An error happened while trying to parse the pom file: ' + err);
        process.exit(3);
      }

      vargs.group_id    || (vargs.group_id = pomResponse.pomObject.project.groupid);
      vargs.artifact_id || (vargs.artifact_id = pomResponse.pomObject.project.artifactid);
      vargs.version     || (vargs.version = pomResponse.pomObject.project.version);
      if (!vargs.group_id || !vargs.artifact_id || !vargs.version) {
        console.log('Artifact details must be specified manually or via a Pom file');
        process.exit(4);
      }

      do_upload(workspace, vargs);
    });
  } else {
      do_upload(workspace, vargs);
  }
});
