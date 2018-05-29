module.exports = function(grunt) {
  
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.config.merge({
        'gh-pages': {
            options: {
                base: 'build'
            },
            src: ['**/*']
        }
    });

}