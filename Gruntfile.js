module.exports = function (grunt)
{
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-tagrelease');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            js: {
                files: 'src/*.js',
                tasks: ['jshint', 'uglify']
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.title %> v<%= pkg.version %> | Copyright (C) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> | <%= pkg.homepage %> | Released under the MIT License */\n',
                report: 'gzip'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.js': ['src/*.js']
                }
            }
        },

        jshint: {
            files: ['Gruntfile.js', 'src/*.js', 'test/*.js'],
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
                    module: true,
                    test: true,
                    equal: true
                }
            }
        },

        qunit: {
            options: {
                timeout: 60000
            },
            all: ['test/*.html']
        },

        bumpup: {
            files: ['package.json', 'bower.json']
        },

        tagrelease: {
            file: 'package.json',
            commit:  true,
            message: 'Marks v%version%.',
            prefix:  '',
            annotate: true
        },

        compress: {
            main: {
                options: {
                    archive: 'dist/<%= pkg.name %>.v<%= pkg.version %>.zip'
                },
                files: [
                    {
                        src: ['*.textile', 'LICENSE'],
                        dest: '<%= pkg.name %>/'
                    },
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['*.js'],
                        dest: '<%= pkg.name %>/'
                    }
                ]
            }
        }
    });

    grunt.registerTask('updatepkg', 'Reloads package.json to memory.', function ()
    {
        grunt.config.set('pkg', grunt.file.readJSON('package.json'));
    });

    grunt.registerTask('release', 'Creates a new release. Usage:\ngrunt release[:patch | :minor | :major]', function (type)
    {
        if (!type)
        {
            type = 'patch';
        }

        grunt.task.run('test');
        grunt.task.run('bumpup:' + type);
        grunt.task.run('updatepkg');
        grunt.task.run('build');
        grunt.task.run('compress');
        grunt.task.run('tagrelease');
    });

    grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('build', ['uglify']);
    grunt.registerTask('default', ['test', 'build']);
    grunt.registerTask('travis', ['jshint', 'qunit', 'build']);
};