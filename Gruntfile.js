/*global module:false*/
module.exports = function(grunt) {
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);
  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    sshconfig: {
    },
    'sftp-deploy': {
    },
    sshexec: {
    }
  });

  grunt.registerTask('deploy', function () {
    var deploy = process.env.DEPLOY && process.env.DEPLOY || '',
    build_env = process.env.BUILD_ENV && process.env.BUILD_ENV || 'deployment',
    target = process.env.TARGET && process.env.TARGET || '',
    configs, sftpelements, sshelements;
    if ( deploy === '' ) {
      return false;
    }
    var sshlist = grunt.file.readJSON('../.' + build_env + '_config_' + deploy + '.json');
    if ( !sshlist ) {
      return false;
    }
    if ( !sshlist.sshconfig ) {
      return false;
    }
    if( !sshlist['sftp-deploy'] && !sshlist.sshexec) {
      return false;
    }

    grunt.config.set('sshconfig', sshlist.sshconfig);
    if ( sshlist['sftp-deploy'] ) {
      sftpelements = Object.keys(sshlist['sftp-deploy']);
      grunt.config.set('sftp-deploy', sshlist['sftp-deploy']);
    }
    if ( sshlist.sshexec ) {
      sshelements = Object.keys(sshlist.sshexec);
      grunt.config.set('sshexec', sshlist.sshexec);
    }
    configs = Object.keys(sshlist.sshconfig);
    if ( target !== '' && !configs[target] ) {
      return false;
    }

    if ( target !== '' ) {
      configs = [ target ];
    }

    configs.forEach(function(config) {
      grunt.option('config', config);
      if ( sftpelements ) {
        sftpelements.forEach(function(sftptask) {
          grunt.task.run('sftp-deploy:' + sftptask);
        });
      }
      if ( sshelements ) {
        sshelements.forEach(function(sshtask) {
          grunt.task.run('sshexec:' + sshtask);
        });
      }
    });
  });
  // Default task.
  grunt.registerTask('default', ['deploy']);
};
