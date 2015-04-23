/*global module */
module.exports = function (grunt) {
    'use strict';

    var sharedDirectory = "Jesse-Cox-For-Windows/Jesse_Cox_For_Windows.Shared";

    grunt.initConfig({
        bower: {
            install: {
                options: {
                    targetDir: sharedDirectory + "/Libraries",
                    copy: true
                },
            },
        },
        shell: {
            options: {
                packages: [
                    "knockout",
                    "lodash",
                    "winrt",
                    "winjs",
                ]
            },
            tsd: {
                command: function (a) {
                    var outputCommand = ["echo Installing TypeScript definition files..."];

                    var options = this.task.current.options();
                    var packages = options.packages;

                    for (var i = 0; i < packages.length; i++) {
                        var pkg = packages[i];

                        // Could use grunt.file.readJson to check if the package already exists in tsd.json.
                        // If so, we should run the reinstall command instead of installing new versions to prevent build breaks.

                        outputCommand.push("tsd query " + pkg + " -a install --save");
                    };

                    return outputCommand.join("&&");
                }
            },
        },
        watch: {
            typescript: {
                files: [sharedDirectory + "/*.ts", sharedDirectory + '/**/*.ts', '!' + sharedDirectory + '/**/*.d.ts'],
                tasks: ["typescript:compileSingle"],
                options: {
                    spawn: false
                }
            }
        },
        typescript: {
            base: {
                src: [sharedDirectory + "/*.ts", sharedDirectory + '/**/*.ts', '!' + sharedDirectory + '/**/*.d.ts'],
                options: {
                    sourceMap: true,
                    removeComments: false, //Must be set to false, else the sourcemaps cannot be loaded.
                }
            },
            compileSingle: {
                src: [],
                options: {
                    sourceMap: true,
                    removeComments: false, //Must be set to false, else the sourcemaps cannot be loaded.
                }
            }
        },
    });

    // Add all plugins that your project needs here
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks('grunt-contrib-watch');

    // TODO: Add tests.
    grunt.registerTask('test', []);

    // define the default task that can be run just by typing "grunt" on the command line
    grunt.registerTask('default', []);
};