/*global module:false*/
module.exports = function(grunt) {
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);
  var deploy = process.env.DEPLOY && process.env.DEPLOY || '',
  build_env = process.env.BUILD_ENV && process.env.BUILD_ENV || 'deployment',
  actions = grunt.file.readJSON('../.' + build_env + '_actions_' + deploy + '.json');
  actions.deploy = grunt.file.readJSON('../.' + build_env + '_config_' + deploy + '.json');

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
