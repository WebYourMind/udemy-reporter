module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      files: ['Gruntfile.js', 'app.js', './authentication/*.js', './components/*.js', './js/ng/*.js', './loadfile/*.js', './navigation/*.js', './reports/*.js', './services/*.js' ],
      options: {
         asi : true,
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true         
        }
      }
    },
    watch: {
      //files: ['<%= jshint.files %>'],
      //tasks: ['jshint', 'qunit']
      all: {
        options: { livereload: true },
        files: ['<%= jshint.files %>' ],
        tasks: ['jshint'],
      },

    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('test', ['jshint', 'qunit']);

  grunt.registerTask('build', ['jshint', 'qunit', 'concat', 'uglify']);

  grunt.registerTask('default', ['watch']);

};