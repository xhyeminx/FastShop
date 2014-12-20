'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
	clean : ['public/js/main.min.js'],
    jshint : {
		files : ['public/js/main.js', 'controllers/js/*.js'],
		options : {
			globals : {
				jQuery : true
			}
		}
	},
	uglify : {
		compress : {
			files : {
				'public/js/main.min.js': ['public/js/main.js']
			},
			options: {
				mangle: false
			}
		}
	}
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task.
  grunt.registerTask('default', ['jshint', 'clean', 'uglify']);

};