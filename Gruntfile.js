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
  grunt.registerTask('default', ['fetch_contracts', 'update_issuers', 'update_stations', 'validate_contracts']);
};