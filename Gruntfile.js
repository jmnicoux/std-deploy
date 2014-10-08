/*global module:false*/
var shell = require('shelljs');
module.exports = function(grunt) {
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);
  var deploy = process.env.DEPLOY && process.env.DEPLOY || '',
  build_env = process.env.BUILD_ENV && process.env.BUILD_ENV || 'deployment',
  build_type = process.env.BUILD_TYPE && process.env.BUILD_TYPE || 'package',
  actions = grunt.file.readJSON('../.' + build_env + '_actions_' + deploy + '.json'),
  build_config = grunt.file.readJSON('../.' + build_env + '_config_' + deploy + '.json');
  actions.deploy = build_config[build_type];

  grunt.registerTask('scp-deploy', function (dst) {
    var options = grunt.config.get('deploy.options');
    var hosts = grunt.config.get('deploy.'+dst);
    var host = hosts.options.host;
    var port = hosts.options.port;
    var username = hosts.options.username;
    var password = hosts.options.password;
    var src = options.src;
    var dest = options.dest;
    shell.exec('sshpass -p "' + password + '" scp -r -P ' + port + ' ' + src + ' ' + username + '@' + host + ':' + dest + '/');
  });
  // Project configuration.
  grunt.initConfig(actions);
  grunt.registerMultiTask('deploy', function () {
    var options = this.options();
    grunt.option.init(options);
    grunt.util.spawn({
      grunt: true,  // use grunt to spawn
      args: options.actions.concat(grunt.option.flags()), // spawn this task
      opts: {stdio : 'inherit'}, // print to the same stdout
    }, function(err, result, code) {
    });
  });
  // Default task.
  grunt.registerTask('default', ['deploy']);
};
