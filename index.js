const Drone = require('drone-node');
const plugin = new Drone.Plugin();

const ArtifactoryAPI = require('artifactory-api');
const pomParser = require("pom-parser");
const glob = require("glob");
const winston = require("winston");

const btoa = require('btoa');
const fs = require('fs');
const path = require('path');

var expands_files = function (path, files) { return [].concat.apply([], files.map((f) => { return glob.sync(path + '/' + f); })); }

var publish_file = function (artifactory, repo_key, project, file, force_upload) {
  return new Promise((resolve, reject) => {
    var basename = path.basename(file);
    // If file to publish is a pom file, change name to official Maven requirements
    if (file.indexOf('pom') > -1) { basename = project.artifact_id + '-' + project.version + '.pom'; }

    winston.info('Uploading ' + file + ' as ' + basename + ' into ' + repo_key);
    return artifactory.uploadFile(repo_key, '/' + replace_dots(project.group_id) + '/' + project.artifact_id + '/' + project.version + '/' + basename, file, force_upload)
    .then((uploadInfo) => {

      winston.info('Upload successful. Available at: ' + uploadInfo.downloadUri)
      resolve();
    }).catch((err) => {

      reject('An error happened while trying to publish the file ' + file + ': ' + err);
    });
  });
}

var do_upload = function (params) {
  // gets build and repository information for the current running build
  const workspace = params.workspace;

  // gets plugin-specific parameters defined in the .drone.yml file
  const vargs = params.vargs;
  const project = {
    group_id: vargs.group_id,
    artifact_id: vargs.artifact_id,
    version: vargs.version
  }

  if (vargs.log_level) { winston.level = vargs.log_level; }

  winston.info('Project groupId: ' + project.group_id);
  winston.info('Project artifactId: ' + project.artifact_id);
  winston.info('Project version: ' + project.version);

  var hash = btoa(vargs.username + ':' + vargs.password)
  var artifactory = new ArtifactoryAPI(vargs.url, hash);

  // Default repo_key to 'libs-snapshot-local' or 'libs-release-local'
  if (!vargs.repo_key) { project.version.toLowerCase().indexOf('snapshot') > -1 ? vargs.repo_key = 'libs-snapshot-local' : vargs.repo_key = 'libs-release-local'; }

  return Promise.all(
    expands_files(workspace.path, vargs.files)
    .map((file) => { return publish_file(artifactory, vargs.repo_key, project, file, vargs.force_upload); })
  );
}

var parse_pom_file = function (params, resolve, reject) {
  if (!fs.existsSync(params.workspace.path + '/' + params.vargs.pom)) {
    return reject('Given pom file has to exists');
  }

  pomParser.parse({ filePath: params.workspace.path + '/' + params.vargs.pom }, function(err, pomResponse) {
    if (err) { return reject('An error happened while trying to parse the pom file: ' + err); }

    params.vargs.group_id    || (params.vargs.group_id = pomResponse.pomObject.project.groupid);
    params.vargs.artifact_id || (params.vargs.artifact_id = pomResponse.pomObject.project.artifactid);
    params.vargs.version     || (params.vargs.version = pomResponse.pomObject.project.version);

    if (!params.vargs.group_id || !params.vargs.artifact_id || !params.vargs.version) {
      return reject('Some artifact details are missing from Pom file');
    }

    if(params.vargs.files.indexOf(params.vargs.pom)==-1) {
      params.vargs.files.push(params.vargs.pom);
    }

    return resolve(params);
  });
}

var parse_package_file = function (params, resolve, reject) {
  if (!fs.existsSync(params.workspace.path + '/' + params.vargs.package)) {
    return reject('Given package file has to exist');
  }

  try {
    var package = require(params.workspace.path + '/' + params.vargs.package)
    var config = package.config || {};

    params.vargs.group_id    || (params.vargs.group_id = config.group_id);
    params.vargs.artifact_id || (params.vargs.artifact_id = config.artifact_id);
    params.vargs.version     || (params.vargs.version = package.version);
  } catch (err) {
    return reject('An error happened while trying to parse the package file: ' + err);
  }

  if (!params.vargs.group_id || !params.vargs.artifact_id || !params.vargs.version) {
    return reject('Some artifact details are missing from package file');
  }

  if(params.vargs.files.indexOf(params.vargs.package)==-1) {
    params.vargs.files.push(params.vargs.package);
  }

  return resolve(params);
}

var check_params = function (params) {
  return new Promise((resolve, reject) => {
    params.vargs.username      || (params.vargs.username = '');
    params.vargs.password      || (params.vargs.password = '');
    params.vargs.files         || (params.vargs.files = []);
    params.vargs.force_upload  || (params.vargs.force_upload = false);

    if (!params.vargs.url) {
      return reject("Artifactory URL is missing and Mandatory");
    }

    if (params.vargs.pom) {
      return parse_pom_file(params, resolve, reject);
    } else if (params.vargs.package) {
      return parse_package_file(params, resolve, reject);
    } else {
      if (!params.vargs.group_id || !params.vargs.artifact_id || !params.vargs.version) {
        return reject('Artifact details must be specified manually if no Pom file is given');
      }

      return resolve(params);
    }
  });
}

var replace_dots = function(param){
  return param.replace(new RegExp('\\.', 'g'),'/');
}

// Expose public methods for tests
if(require.main === module) {
  plugin.parse()
  .then(check_params)
  .then(do_upload)
  .catch((msg) => { winston.error(msg); process.exit(1); });
} else {
  module.exports = {
    check_params: check_params,
    parse_pom_file: parse_pom_file,
    parse_package_file: parse_package_file,
    expands_files: expands_files,
    do_upload: do_upload,
    replace_dots: replace_dots
  }
}
