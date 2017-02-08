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
  var TARGET = process.env.TARGET && process.env.TARGET || null;
  var config_file_base = '../.' + build_env;
  var build_config = grunt.file.exists(config_file_base + '_actions_' + deploy + '.json') && grunt.file.readJSON(config_file_base + '_actions_' + deploy + '.json') || {};
  var server_configs = grunt.file.exists(config_file_base + '_configs.json') && grunt.file.readJSON('../.' + build_env + '_configs.json') || {};

  actions.deploy = build_config[build_type];
  grunt.initConfig(actions);
  grunt.config.set('deploy.options.lstserver', server_configs);
  grunt.registerTask('filterdest', function () {
    var options = this.options(),
      hosts = grunt.config.get(options.hosts),
      hkeys = Object.keys(hosts),
      host,
      fltlist = options.fltlist,
      result={};
    if (options.target && options.target != "" && hosts.hasOwnProperty(options.target)) {
      result[options.target] = hosts[options.target]; 
      grunt.config.set('filterdest.result', result);
      return true;
    }
    fltlist.map(function(hostn) {
      if(hosts.hasOwnProperty(hostn)) {
        result[hostn] = hosts[hostn];
      }
    });
    grunt.config.set('filterdest.result', result);
    return true;
  });
  grunt.registerTask('sshCmd', function() {
    var options = this.options(),
      result = grunt.config.get('filterdest.result'),
      dst = options.task;
    for (var index in result){
      if (result.hasOwnProperty(index)) {
        if(result[index].options) {
          var host = result[index].options;
          grunt.config.set('TARGET', index);
          task = grunt.config.get('deploy.ssh-deploy:'+dst);
          if (host) {
            if (process.env.DEPLOYHOST && process.env.DEPLOYHOST!="") {
              host.host=process.env.DEPLOYHOST;
              host.username=process.env.DEPLOYUSER;
              host.port=process.env.DEPLOYPORT;
              host.key=process.env.DEPLOYKEY;
              delete host.password;
            }
            if (!host.host || !host.username) {
              return false;
            }
            if (!host.password && !host.key) {
              return false;
            }
            host.port = host.port && host.port || 22;
            if (task.cmd) {
              if (host.password) {
                shell.exec('sshpass -p "' + host.password + '" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -p ' + host.port + ' ' + host.username + '@' + host.host + ' \'' + task.cmd + '\'' );
              } else {
                shell.exec('ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -i '+ host.key + ' -p ' + host.port + ' ' + host.username + '@' + host.host + ' \'' + task.cmd + '\'' );
              }
            } else if(task.src && task.dest) {
              if (host.password) {
                shell.exec('sshpass -p "' + host.password + '" scp -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -r -P ' + host.port + ' ' + task.src + ' ' + host.username + '@' + host.host + ':' + task.dest);
              } else {
                shell.exec('scp -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -i '+ host.key +' -r -P ' + host.port + ' ' + task.src + ' ' + host.username + '@' + host.host + ':' + task.dest);
              }
            }
          }
        }
      }
    }
  });
  grunt.registerTask('deploy:ssh-deploy', function (dst) {
    var options = grunt.config.get('deploy.options');
    var task = grunt.config.get('deploy.ssh-deploy:'+dst);
    var lstservertask = task.lstserver;
    if (!TARGET && (!lstservertask || lstservertask==undefined)) {
      return true;
    }
    if (TARGET && TARGET !== "" && lstservertask && lstservertask!=undefined && lstservertask.indexOf(TARGET) === -1) {
      return true;
    }
    var hosts = options.lstserver;
    grunt.config.set('filterdest.options', {'hosts': 'deploy.options.lstserver', 'target': TARGET, 'fltlist' : lstservertask });
    grunt.config.set('sshCmd.options', {task:dst});
    grunt.task.run(['filterdest', 'sshCmd']);
  });
  // Project configuration.
  grunt.registerMultiTask('deploy', function () {
    var options = this.options();
    grunt.option.init(options);
  });
  // Default task.
  grunt.registerTask('default', ['deploy']);
};
