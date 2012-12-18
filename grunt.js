/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		
		pkg: {
			company: 'jamiecopeland',
			companyUrl: 'http://www.jamiecopeland.com',
			title: 'Project',
			version: '1.0.0'
		},
		
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},
		
		lint: {
			files: ['grunt.js', 'develop/js/src/**/*.js']
		},

		jshint: {
			options: {
				curly: true,
				eqeqeq: false,
				immed: true,
				latedef: true,
				newcap: false,
				noarg: true,
				sub: true,
				boss: true,
				eqnull: true,
				browser: true,
				smarttabs: true
			},
			globals: {
				jQuery: true
			}
		},

		less: {
			desktop: {
				files: {
					'develop/css/styles.css': 'develop/less/styles.less'
				},
				options: {
					style: 'compact'
				}
			}
		},

		watch: {
			// lint: {
			// 	files: '<config:lint.files>',
			// 	tasks: 'lint'
			// },
			less: {
				files: 'develop/less/**/*.less',
				tasks: 'less'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-requirejs');

	// Default task.
	// grunt.registerTask('default', 'lint requirejs sass');
	grunt.registerTask('default', 'less');

};
