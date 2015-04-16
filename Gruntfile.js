'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
	watch : {
		scripts: {
			files: ['<%= uglify.build.src %>', '!public/js/*.min.js'],
			tasks: ['jshint', 'uglify']
		},
		less: {
			files: 'public/css/*.less',
			tasks: ['less:development']
		}
	},
	clean : ['public/js/main.min.js', 'public/css/main.css'],
    jshint : {
		files : ['public/js/src/main.js', 'controllers/js/*.js'],
		options : {
			globals : {
				jQuery : true,
				Modernizr : true
			}
		}
	},
	uglify : {
		options: {
			beautify: true,
			report: 'gzip'
		},
		build : {
			src: ['public/js/main.js'],
			dest: 'public/js/main.min.js'
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
};
