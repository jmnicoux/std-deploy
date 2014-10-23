/*global module:false*/
var shell = require('shelljs');
module.exports = function(grunt) {
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);
  var deploy = process.env.DEPLOY && process.env.DEPLOY || '',
  build_env = process.env.BUILD_ENV && process.env.BUILD_ENV || 'deployment',
  build_type = process.env.BUILD_TYPE && process.env.BUILD_TYPE || 'package',
  actions = {};
  var TARGET = process.env.TARGET && process.env.TARGET || '';
  var build_config = grunt.file.readJSON('../.' + build_env + '_actions_' + deploy + '.json');
  actions.deploy = build_config[build_type];
  grunt.initConfig(actions);
  grunt.registerTask('deploy:ssh-deploy', function (dst) {
    var options = grunt.config.get('deploy.options');
    var task = grunt.config.get('deploy.ssh-deploy:'+dst);
    var lstserver = task.lstserver;
    for (var index in lstserver){
      if (lstserver.hasOwnProperty(index)) {
        var srv = lstserver[index];
        var hosts = options.lstserver;
        var result = hosts.filter(function(o) {
          if(TARGET && TARGET != "" && TARGET === srv ) {
            return o.hasOwnProperty(srv);
          }
          if(!TARGET || TARGET === "") {
            return o.hasOwnProperty(srv);
          }
        });
        if(result && result[0] && result[0][srv] && result[0][srv].options) {
          var host = result[0][srv]["options"];
          if (TARGET) {
              grunt.config.set('TARGET', TARGET);
          } else {
              grunt.config.set('TARGET', srv);
          }
          task = grunt.config.get('deploy.ssh-deploy:'+dst);
          var cmd = task.cmd && task.cmd || null;
          var src = task.src && task.src || null;
          var dest = task.dest && task.dest || null;
          if (host) {
            var ip = host.host && host.host || null;
            var port = host.port && host.port || "22";
            var username = host.username && host.username || null;
            var password = host.password && host.password || null;
            var key = host.key && host.key || null;
            if (!ip || !username) {
              return;
            }
            if (!password && !key) {
              return;
            }
            if (cmd) {
              if (password) {
                shell.exec('sshpass -p "' + password + '" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -p ' + port + ' ' + username + '@' + ip + ' \'' + cmd + '\'' );
              } else {
                shell.exec('ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -i '+ key + ' -p ' + port + ' ' + username + '@' + ip + ' \'' + cmd + '\'' );
              }
            } else if(src && dest) {
              if (password) {
                shell.exec('sshpass -p "' + password + '" scp -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -r -P ' + port + ' ' + src + ' ' + username + '@' + ip + ':' + dest);
              } else {
                shell.exec('scp -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -i '+ key +' -r -P ' + port + ' ' + src + ' ' + username + '@' + ip + ':' + dest);
              }
            }
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
