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
    var task = grunt.config.get('deploy.'+dst);
    var lstserver = task.lstserver;
    var src = task.src;
    var dest = task.dest;
    for (var index in lstserver){
      if (lstserver.hasOwnProperty(index)) {
        var srv = lstserver[index];
        var hosts = options.lstserver;
        var result = hosts.filter( function(o){return o.hasOwnProperty(srv); } );
        if (result) {
          var host = result[0][srv];
          if (host) {
            var ip = host.options.host;
            var port = host.options.port;
            var username = host.options.username;
            var password = host.options.password;
            // console.log('sshpass -p "' + password + '" scp -r -P ' + port + ' ' + src + ' ' + username + '@' + ip + ':' + dest + '/');
            shell.exec('sshpass -p "' + password + '" scp -r -P ' + port + ' ' + src + ' ' + username + '@' + ip + ':' + dest + '/');
          }
        }
      }
    }
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
