module.exports = function (grunt) {

    grunt.initConfig({

        clean:  [ 'dist' ],

        useminPrepare: {
            html: 'src/index.html',
            options:{
                dest:'dist'
            }
        },

        usemin: {
            html: ['dist/index.html']
        },

        copy: {
            main: {
                expand: true,
                cwd: 'src/',
                src: ['**', '!js/**', '!components/**', '!**/*.css'],
                dest: 'dist/'
            }

        },

        jshint: {
            options: {
                curly: false,
                browser: true,
                eqeqeq: true,
                forin: false,
                immed: false,
                expr: false,
                indent: false,
                noempty: true,
                plusplus: false,
                unused: false,
                boss: true,
                evil: true,
                laxbreak: true,
                multistr: true,
                scripturl: true,
                '-W030': true,
                '-W083': false
            }
        },

        removelogging: {
            dist: {
                src: "dist/**/*.js" // Each file will be overwritten with the output!
            }
        },

        watch: {
            scripts: {
                files: ['src/**/*.js','src/**/*.css','src/index.html'],
                tasks: ['common']
            }
        },

        connect: {
            prod: {
                options: {
                    port: 8000,
                    base: 'dist'
                }
            },
            dev: {
                options: {
                    port: 8001,
                    base: 'src'
                    //keepalive: true

                }
            }
        },

        uglify: {
            options: {
                mangle: false,
                compress: {
                    drop_console: true // <-
                }
            }
        },

        wiredep: {
            task: {

                // Point to the files that should be updated when
                // you run `grunt wiredep`
                src: [
                    'src/*.html'
                ],

                options: {
                    // See wiredep's configuration documentation for the options
                    // you may pass:
                    dependencies: true,
                    directory:'src/components',
                    devDependencies: true,
                    includeSelf: true,
                    exclude: [],
                    fileTypes: {},
                    ignorePath: '',
                    overrides: {}

                    // https://github.com/taptapship/wiredep#configuration
                }
            }
        },
        karma: {
            options: {
                configFile: 'config/karma.conf.js'
            },
            unit: {
                singleRun: true
            },
            continuous: {
                singleRun: false,
                autoWatch: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-karma');
    //grunt.loadNpmTasks('karma-jasmine');
    //grunt.loadNpmTasks('karma');

    grunt.registerTask('common',['wiredep', 'clean', 'copy', 'useminPrepare', 'concat', 'cssmin', 'uglify', 'usemin']);
//    grunt.registerTask('common',['wiredep', 'clean', 'copy', 'useminPrepare', 'concat', 'cssmin', 'usemin']);
    grunt.registerTask('build',['common','connect','watch']);
    grunt.registerTask('serve',['connect']);

};
