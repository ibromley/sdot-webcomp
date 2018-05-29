module.exports = function(grunt) {

  //load tasks
  grunt.loadTasks("./tasks");

  grunt.registerTask("content", "Load content from data files", ["state", "json", "sheets"]);
  grunt.registerTask("template", "Build HTML from content/templates", ["content", "build"]);
  grunt.registerTask("static", "Build all files", ["copy", "template", "bundle", "less"]);
  grunt.registerTask("default", ["clean", "static", "connect:dev", "watch"]);
  grunt.registerTask("deploy", ["clean", "static", "gh-pages"]);


};
