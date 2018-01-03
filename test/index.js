var arti = require('../index');

var expect = require('unexpected');
var nock = require('nock');

describe('Drone Artifactory', function () {
  describe('#check_params()', function () {

    beforeEach('reset Drone 0.5 environment', function () {
      delete process.env.PLUGIN_URL;
      delete process.env.PLUGIN_GROUP_ID;
      delete process.env.PLUGIN_ARTIFACT_ID;
      delete process.env.PLUGIN_VERSION;
      delete process.env.PLUGIN_POM;
      delete process.env.PLUGIN_FILES;
    });

    it('should stop if Artifactory URL is not provided', function () {
      var params = { vargs: {}};

      return expect(arti.check_params(params), 'when rejected', 'to contain', 'Artifactory URL is missing and Mandatory');
    });
    it('should set default values', function () {
      // Set required parameters
      var params = { vargs: {url: 'http', group_id: 'drone', artifact_id: 'artifactory', version: 2.0}};

      return expect(arti.check_params(params), 'when fulfilled', 'to satisfy', { vargs: { username: '', password: '', files: [], force_upload: false } });
    });
    it('should stop if group id nor pom file is not provided', function () {
      var params = { vargs: { url: 'http' }};

      return expect(arti.check_params(params), 'when rejected', 'to contain', 'Artifact details must be specified manually if no Pom file is given');
    });
    it('should stop if artifact id nor pom file is not provided', function () {
      var params = { vargs: { url: 'http', group_id: 'drone' }};

      return expect(arti.check_params(params), 'when rejected', 'to contain', 'Artifact details must be specified manually if no Pom file is given');
    });
    it('should stop if version nor pom file is not provided', function () {
      var params = { vargs: { url: 'http', group_id: 'drone', artifact_id: 'artifactory' }};

      return expect(arti.check_params(params), 'when rejected', 'to contain', 'Artifact details must be specified manually if no Pom file is given');
    });
    it('should stop if pom file does not exists', function () {
      var params = { vargs: { url: 'http', pom: 'NOP' }, workspace: {}};

      return expect(arti.check_params(params), 'when rejected', 'to contain', 'Given pom file has to exists');
    });
    it('should stop if pom file is invalid', function () {
      var params = { vargs: { url: 'http', pom: 'pom.json' }, workspace: { path: './test/files' }};

      return expect(arti.check_params(params), 'when rejected', 'to contain', 'An error happened while trying to parse the pom file');
    });
    it('should stop if pom file is not enough', function () {
      var params = {vargs: { url: 'http', pom: 'useless.xml'}, workspace: { path: './test/files' }};

      return expect(arti.check_params(params), 'when rejected', 'to contain', 'Some artifact details are missing from Pom file');
    });
    it('should read details from a correct pom file', function () {
      var params = {vargs: { url: 'http', pom: 'pom.xml'}, workspace: { path: './test/files' }};

      return expect(arti.check_params(params), 'when fulfilled', 'to satisfy', { vargs: { group_id: 'com.example.drone', artifact_id: 'artifactory', version: '0'} });
    });
    it('should read details from correct group id, artifact id and version', function () {
      var params = {vargs: { url: 'http', group_id: 'com.example.drone', artifact_id: 'artifactory', version: '0'}, workspace: { path: './test/files' }};

      return expect(arti.check_params(params), 'when fulfilled', 'to satisfy', { vargs: { group_id: 'com.example.drone', artifact_id: 'artifactory', version: '0'} });
    });
    it('should add pom to files automatically if provided',function() {
      var params={vargs: { url: 'http',pom: 'pom.xml'}, workspace: {path: './test/files'}};

      return expect(arti.check_params(params),'when fulfilled', 'to satisfy', {vargs: {files: ['pom.xml']}})
    });
    it('should not add duplicate pom to files if pom already specified as file',function(){
      var params={vargs: { url: 'http',pom: 'pom.xml',files: ['pom.xml']}, workspace: {path: './test/files'}};

      return expect(arti.check_params(params),'when fulfilled', 'to satisfy', {vargs: {files: ['pom.xml']}})
    });
    describe('load params from env in drone 0.5', function () {
      it('should read details from a correct pom file', function () {
        var params = { vargs: {} };

        process.env['PLUGIN_URL'] = 'http'
        process.env['PLUGIN_POM'] = 'test/files/pom.xml'

        return expect(arti.check_params(params), 'when fulfilled', 'to satisfy', { vargs: { group_id: 'com.example.drone', artifact_id: 'artifactory', version: '0'} });
      });
      it('should read details from correct group id, artifact id and version', function () {
        var params = {};

        process.env['PLUGIN_URL'] = 'http'
        process.env['PLUGIN_GROUP_ID'] = 'com.example.drone'
        process.env['PLUGIN_ARTIFACT_ID'] = 'artifactory'
        process.env['PLUGIN_VERSION'] = '0'

        return expect(arti.check_params(params), 'when fulfilled', 'to satisfy', { vargs: { group_id: 'com.example.drone', artifact_id: 'artifactory', version: '0'} });
      });
      it('should add pom to files automatically if provided',function() {
        var params={};

        process.env['PLUGIN_URL'] = 'http'
        process.env['PLUGIN_POM'] = 'test/files/pom.xml'

        return expect(arti.check_params(params),'when fulfilled', 'to satisfy', {vargs: {files: ['test/files/pom.xml']}})
      });
      it('should not add duplicate pom to files if pom already specified as file',function(){
        var params={};

        process.env['PLUGIN_URL'] = 'http'
        process.env['PLUGIN_POM'] = 'test/files/pom.xml'
        process.env['PLUGIN_FILES'] = 'test/files/pom.xml'

        return expect(arti.check_params(params),'when fulfilled', 'to satisfy', {vargs: {files: ['test/files/pom.xml']}})
      });
      it('should properly parse files',function(){
        var params={};

        process.env['PLUGIN_URL'] = 'http'
        process.env['PLUGIN_GROUP_ID'] = 'com.example.drone'
        process.env['PLUGIN_ARTIFACT_ID'] = 'artifactory'
        process.env['PLUGIN_VERSION'] = '0'
        process.env['PLUGIN_FILES'] = 'file1,file2,file3'

        return expect(arti.check_params(params),'when fulfilled', 'to satisfy', {vargs: {files: ['file1','file2','file3']}})
      });
      it('load secrets from environment',function(){
        var params={};

        process.env['PLUGIN_GROUP_ID'] = 'com.example.drone'
        process.env['PLUGIN_ARTIFACT_ID'] = 'artifactory'
        process.env['PLUGIN_VERSION'] = '0'

        process.env['ARTIFACTORY_URL'] = 'https'
        process.env['ARTIFACTORY_USERNAME'] = 'johndoe'
        process.env['ARTIFACTORY_PASSWORD'] = 'mypassword'

        return expect(arti.check_params(params),'when fulfilled', 'to satisfy', {vargs: {url: 'https', username: 'johndoe', password: 'mypassword'}})
      });
    });
  });

  describe('#expands_files()', function () {
    it('should be able to resolve wildcards', function () {

      expect(arti.expands_files('./test/files', ['*.json']), 'to contain', './test/files/pom.json');
    });
    it('should be able to resolve a mix of wildcards and files', function () {

      expect(arti.expands_files('./test/files', ['*.xml', 'test.jar']), 'to contain', './test/files/pom.xml', './test/files/useless.xml', './test/files/test.jar');
    });
    it('should be able to accept an empty array of files', function () {

      expect(arti.expands_files('./test/files', []), 'to be empty');
    });
    it('should be able to accept glob paths', function() {
      expect(arti.expands_files('./test', ['**/*.jar']), 'to contain', './test/files/test.jar');
    });
  });

  describe('#do_upload()', function () {
    it('should publish a pom file with required name', function () {
      var req = nock('http://arti.facto.ry')
                .intercept('/artifactory/libs-release-local/com/example/drone/arti/2.0/arti-2.0.pom', 'HEAD')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(404)
                .put('/artifactory/libs-release-local/com/example/drone/arti/2.0/arti-2.0.pom')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(201, {});

      var params = { workspace: { path: './test/files'},
        vargs: {
          url: 'http://arti.facto.ry',
          username: 'admin', password: 'admin',
          group_id: 'com.example.drone', artifact_id: 'arti', version: '2.0',
          files: ['pom.xml'],
          log_level: 'warn'
        }
      };

      return expect(arti.do_upload(params).then(() => { return req.isDone(); }), 'when fulfilled', 'to equal', true);
    });
    it('should publish a file to snapshot repo', function () {
      var req = nock('http://arti.facto.ry')
                .intercept('/artifactory/libs-snapshot-local/drone/arti/2.0-SNAPSHOT/test.jar', 'HEAD')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(404)
                .put('/artifactory/libs-snapshot-local/drone/arti/2.0-SNAPSHOT/test.jar')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(201, {});

      var params = { workspace: { path: './test/files'},
        vargs: {
          url: 'http://arti.facto.ry',
          username: 'admin', password: 'admin',
          group_id: 'drone', artifact_id: 'arti', version: '2.0-SNAPSHOT',
          files: ['test.jar'],
          log_level: 'warn'
        }
      };

      return expect(arti.do_upload(params).then(() => { return req.isDone(); }), 'when fulfilled', 'to equal', true);
    });
    it('should publish a file to a custom repo', function () {
      var req = nock('http://arti.facto.ry')
                .intercept('/artifactory/custom_repo/drone/arti/2.0-SNAPSHOT/test.jar', 'HEAD')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(404)
                .put('/artifactory/custom_repo/drone/arti/2.0-SNAPSHOT/test.jar')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(201, {});

      var params = { workspace: { path: './test/files'},
        vargs: {
          url: 'http://arti.facto.ry',
          username: 'admin', password: 'admin',
          group_id: 'drone', artifact_id: 'arti', version: '2.0-SNAPSHOT',
          files: ['test.jar'],
          repo_key: 'custom_repo',
          log_level: 'warn'
        }
      };

      return expect(arti.do_upload(params).then(() => { return req.isDone(); }), 'when fulfilled', 'to equal', true);
    });
    it('should fail if an error happen during upload', function () {
      var req = nock('http://arti.facto.ry')
                .intercept('/artifactory/libs-snapshot-local/drone/arti/2.0-SNAPSHOT/test.jar', 'HEAD')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(404)
                .put('/artifactory/libs-snapshot-local/drone/arti/2.0-SNAPSHOT/test.jar')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(500, {});

      var params = { workspace: { path: './test/files'},
        vargs: {
          url: 'http://arti.facto.ry',
          username: 'admin', password: 'admin',
          group_id: 'drone', artifact_id: 'arti', version: '2.0-SNAPSHOT',
          files: ['test.jar'],
          log_level: 'warn'
        }
      };

      return expect(arti.do_upload(params).then(() => { return req.isDone(); }), 'to be rejected');
    });
    it('should fail if file exists on repository but force_update false', function () {
      var req = nock('http://arti.facto.ry')
                .intercept('/artifactory/libs-snapshot-local/drone/arti/2.0-SNAPSHOT/test.jar', 'HEAD')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(200);

      var params = { workspace: { path: './test/files'},
        vargs: {
          url: 'http://arti.facto.ry',
          username: 'admin', password: 'admin',
          group_id: 'drone', artifact_id: 'arti', version: '2.0-SNAPSHOT',
          files: ['test.jar'],
          log_level: 'warn'
        }
      };

      return expect(arti.do_upload(params).then(() => { return req.isDone(); }), 'to be rejected');
    });
    it('should force upload if requested', function () {
      var req = nock('http://arti.facto.ry')
                .intercept('/artifactory/libs-snapshot-local/drone/arti/2.0-SNAPSHOT/test.jar', 'HEAD')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(200)
                .put('/artifactory/libs-snapshot-local/drone/arti/2.0-SNAPSHOT/test.jar')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(201, {});

      var params = { workspace: { path: './test/files'},
        vargs: {
          url: 'http://arti.facto.ry',
          username: 'admin', password: 'admin',
          group_id: 'drone', artifact_id: 'arti', version: '2.0-SNAPSHOT',
          files: ['test.jar'],
          force_upload: true,
          log_level: 'warn'
        }
      };

      return expect(arti.do_upload(params).then(() => { return req.isDone(); }), 'when fulfilled', 'to equal', true);
    });
    it('should be able to upload two files', function () {
      var req = nock('http://arti.facto.ry')
                .intercept('/artifactory/libs-snapshot-local/drone/arti/2.0-SNAPSHOT/arti-2.0-SNAPSHOT.pom', 'HEAD')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(404)
                .put('/artifactory/libs-snapshot-local/drone/arti/2.0-SNAPSHOT/arti-2.0-SNAPSHOT.pom')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(201, {})
                .intercept('/artifactory/libs-snapshot-local/drone/arti/2.0-SNAPSHOT/test.jar', 'HEAD')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(404)
                .put('/artifactory/libs-snapshot-local/drone/arti/2.0-SNAPSHOT/test.jar')
                .basicAuth({ user: 'admin', pass: 'admin' })
                .reply(201, {});

      var params = { workspace: { path: './test/files'},
        vargs: {
          url: 'http://arti.facto.ry',
          username: 'admin', password: 'admin',
          group_id: 'drone', artifact_id: 'arti', version: '2.0-SNAPSHOT',
          files: ['pom.xml', 'test.jar'],
          log_level: 'warn'
        }
      };

      return expect(arti.do_upload(params).then(() => { return req.isDone(); }), 'when fulfilled', 'to equal', true);
    });
  });

  describe('#replace_dots()', function () {
    it('should be able to replace dots', function () {
      expect(arti.replace_dots('com.example.xyz'), 'to contain', 'com/example/xyz');
    });
  });

  describe('#get_checksums()', function () {
    it('should return md5 and sha1 checksums', function () {
      var hashes = { md5: '875a40cf62dae71c4ef76d54549d2278', sha1: 'a96897ba300505431175d43c753875407de7a134'};
      return expect(arti.get_checksums('./test/files/pom.xml'), 'when fulfilled', 'to equal', hashes);
    });
  });
});
