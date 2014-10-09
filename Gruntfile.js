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

  grunt.initConfig(actions);
  grunt.registerTask('deploy:scp-deploy', function (dst) {
    var options = grunt.config.get('deploy.options');
    var task = grunt.config.get('deploy.scp-deploy:'+dst);
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
            shell.exec('sshpass -p "' + password + '" scp -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -r -P ' + port + ' ' + src + ' ' + username + '@' + ip + ':' + dest + '/');
          }
        }
      }
    }
  });
  // Project configuration.
  grunt.registerMultiTask('deploy', function () {
    var options = this.options();
    grunt.option.init(options);
  });
  // Default task.
  grunt.registerTask('default', ['deploy']);
};
