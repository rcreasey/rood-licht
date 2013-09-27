'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: [
         'Gruntfile.js'
       , 'tasks/**/*.js'
      ]
    },
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('contracts', ['fetch_contracts', 'update_issuers', 'update_stations', 'validate_contracts']);
  grunt.registerTask('stations', ['update_outposts']);

  grunt.registerTask('default', ['contracts']);
};