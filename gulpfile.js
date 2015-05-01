var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var mocha = require('gulp-mocha');

gulp.task('default', function() {

});

gulp.task('start', function() {
	nodemon({
		script: 'index.js',
		env: 'js',
		env: {
			NODE_ENV: 'development'
		}
	});
});

gulp.task('test', function() {
	return gulp.src('tests/test.js', {read: false})
		.pipe(mocha());
});
