var gulp = require('gulp');

var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var exit = require('gulp-exit');
 
gulp.task('pre-test', function () {
  return gulp.src(['index.js', 'lib/**/*.js'])
    // Covering files 
    .pipe(istanbul())
    // Force `require` to return covered files 
    .pipe(istanbul.hookRequire());
});
 
gulp.task('default', ['pre-test'], function () {
  return gulp.src(['test/*.js'])
    .pipe(mocha())
    // Creating the reports after tests ran 
    .pipe(istanbul.writeReports())
    // Enforce a coverage of a minimal threshold
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
    .pipe(exit());
});
