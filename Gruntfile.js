/*global module:false*/
module.exports = function(grunt) {
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);
  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    'sftp-deploy': {
    },
    sshexec: {
    }
  });

  grunt.registerTask('deploy', function () {
    var deploy = process.env.DEPLOY && process.env.DEPLOY || '',
    build_env = process.env.BUILD_ENV && process.env.BUILD_ENV || 'deployment',
    target = process.env.TARGET && process.env.TARGET || '',
    configs, elements;
    if ( deploy === '' ) {
      return false;
    }
    var sshlist = grunt.file.readJSON('../.' + build_env + '_config_' + deploy + '.json');
    if ( !sshlist ) {
      return false;
    }
    if ( target !== '' && sshlist[target] ) {
      configs = [ target ];
      if( !configs ) {
        return false;
      }
      elements = {};
      elements[target] = sshlist[target];
    } else if ( target !== '' ) {
      return false;
    } else {
      configs = Object.keys(sshlist);
      if ( !configs ) {
        return false;
      }
      elements = sshlist;
    }
    
    configs.forEach(function(config) {
      var tasks = Object.keys(elements[config]);
      tasks.forEach(function(task) {
        var details = Object.keys(elements[config][task])
        grunt.config.set(task, elements[config][task]);
        details.forEach(function(value){
          grunt.task.run(task +':' + value);
        });
      });
    });
  });
  // Default task.
  grunt.registerTask('default', ['deploy']);
};
