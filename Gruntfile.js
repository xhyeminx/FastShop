'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
	clean : ['public/js/main.min.js', 'public/css/main.css'],
    jshint : {
		files : ['public/js/main.js', 'controllers/js/*.js'],
		options : {
			globals : {
				jQuery : true,
				Modernizr : true
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
	},
	less : {
		development : {
			options : {
				paths : ['public/css']
			},
			files : {
				'public/css/main.css': 'public/css/main.less'
			}
		},
		production : {
			options : {
				paths : ['public/css']
			},
			files : {
				'public/css/main.css': 'public/css/main.less'
			}
		}
	}
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');

  // Default task.
  grunt.registerTask('default', ['jshint', 'clean', 'less', 'uglify']);

  // Watch and compile less
  grunt.registerTask('watch', ['less']);
};
