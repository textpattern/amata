module.exports = function (grunt)
{
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                banner: '/*! <%= pkg.title %> v<%= pkg.version %> | Copyright (C) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> | <%= pkg.homepage %> */\n',
                report: 'gzip'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.js': ['src/*.js']
                }
            }
        },

        jshint: {
            files: ['Gruntfile.js', 'src/*.js'],
            options: {
                bitwise: true,
                camelcase: true,
                curly: true,
                eqeqeq: true,
                es3: true,
                forin: true,
                immed: true,
                indent: 4,
                latedef: true,
                noarg: true,
                noempty: true,
                nonew: true,
                quotmark: 'single',
                undef: true,
                unused: true,
                strict: true,
                trailing: true,
                browser: true,
                globals: {
                    jQuery: true,
                    Zepto: true,
                    define: true,
                    module: true
                }
            }
        }
    });

    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('build', ['uglify']);
    grunt.registerTask('default', ['test', 'build']);
};