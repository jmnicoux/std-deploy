/*global module:false*/
module.exports = function(grunt) {
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);
  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    'sftp-put': {
    },

  });

  grunt.registerTask('deploy', function () {
    var deploy = process.env.DEPLOY && process.env.DEPLOY || '',
    target = process.env.TARGET && process.env.TARGET || '';
    config;
    if ( deploy === '' ) {
      return false;
    }l
    var sshlist = grunt.file.readJSON('../.' + deploy + '_config.json'));
    if ( !sshlist ) {
      return false;
    }

    if ( target !== '' && sshlist.sftp_put && sshlist.sftp_put[target]) {
      grunt.config.set('sftp-put', sshlist.sftp_put[target]);
      return grunt.task.run('sftp-put:'+ target);
    } else if ( target !== '' ) {
      return false;
    }

    if( !sshlist.sftp_put ) {
      return false;
    }
    grunt.config.set('sftp-put', sshlist.sftp_put);
    config = Object.keys(sshlist.sftp_put);
    if ( !config ) {
      return false;
    }
    config.forEach(function(value){
      grunt.task.run('sftp-put:' + value);
    });
  });
  // Default task.
  grunt.registerTask('default', ['deploy']);
};
