module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        options: {
          transform: [
            ["babelify", {
              loose: "all"
            }]
          ]
        },
        files: {
          "./dist/main.js": ["./modules/d3.js", "./modules/main.js"]
        }
      }
    },
    watch: {
      scripts: {
        files: ["./modules/*.js"],
        tasks: ["browserify"]
      }
    },
    jasmine: {
      test: {
        src: 'client.js',
        options: {
          specs: 'test/*.spec.js'
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jasmine");

  grunt.registerTask("default", ["watch"]);
  grunt.registerTask("build", ["browserify"]);
};
