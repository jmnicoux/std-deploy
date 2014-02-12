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

  });

  grunt.registerTask('deploy', function () {
    var deploy = process.env.DEPLOY && process.env.DEPLOY || '',
    var build_env = process.env.BUILD_ENV && process.env.BUILD_ENV || 'deployment',
    var target = process.env.TARGET && process.env.TARGET || '';
    config;
    if ( deploy === '' ) {
      return false;
    }l
    var sshlist = grunt.file.readJSON('../.' + build_env + '_config_' + deploy + '.json');
    if ( !sshlist ) {
      return false;
    }

    if ( target !== '' && sshlist.sftp_deploy && sshlist.sftp_deploy[target]) {
      grunt.config.set('sftp-deploy', sshlist.sftp_deploy[target]);
      return grunt.task.run('sftp-deploy:'+ target);
    } else if ( target !== '' ) {
      return false;
    }

    if( !sshlist.sftp_put ) {
      return false;
    }
    grunt.config.set('sftp-deploy', sshlist.sftp_deploy);
    config = Object.keys(sshlist.sftp_deploy);
    if ( !config ) {
      return false;
    }
    config.forEach(function(value){
      grunt.task.run('sftp-deploy:' + value);
    });
  });
  // Default task.
  grunt.registerTask('default', ['deploy']);
};
