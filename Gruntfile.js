module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options : {
        banner: '#!/usr/bin/env node\n\n'
      },
      bin: {
        src: 'index.js',
        dest: 'bin/index.js'
      }
    },
    replace: {
      bin: {
        src: '<%= concat.bin.dest %>',
        dest: '<%= concat.bin.dest %>',
        replacements: [{
          from: './',
          to: '../'
        }, {
          from: 'UA-XXXXXXX-XX',
          to: 'UA-5427757-50'
        }]
      }
    },
    watch: {
      scripts: {
        files: ['Gruntfile.js'],
        tasks: ['concat', 'replace']
      }
    }
  });

  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('compile', ['concat', 'replace']);
};
