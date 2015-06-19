var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');
var prettify = require('gulp-jsbeautifier');
var args = require('yargs').argv;
var fs = require('fs');
var karma = require('karma').server;
var protractor = require('gulp-protractor').protractor;
var shell = require('gulp-shell');

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

gulp.task('test-karma', function(done) {
	karma.start({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, done);
});


gulp.task('test-protractor', function() {
	var stream = gulp.src(['tests/protractor-*.js'])
		.pipe(protractor({
			configFile: 'protractor.conf.js'
		})).on('error', function(e) { throw e });
});

gulp.task('lint', ['lint-server', 'lint-ui', 'lint-tests']);

gulp.task('lint-server', function (cb) {
	var wstream = fs.createWriteStream('checkstyle-server.xml');

	return gulp.src(['index.js', 'routes/**/*.js', 'services/**/*.js'])
		.pipe(eslint({
			rules: {
				quotes: 0,
				'no-mixed-spaces-and-tabs': 1,
				"indent": [2, "tab"]
			},
			envs: [
				'node'
			]
		}))
		.pipe(eslint.format())
		.pipe(eslint.format('checkstyle', wstream))
		.pipe(eslint.failOnError());

	
});

gulp.task('lint-ui', function (cb) {
	var wstream = fs.createWriteStream('checkstyle-ui.xml');

	return gulp.src(['public/js/*.js'])
		.pipe(eslint({
			globals: {
				angular: true
			},
			rules: {
				quotes: 0,
				'no-mixed-spaces-and-tabs': 1,
				"indent": [2, "tab"]
			},
			envs: [
				'browser'
			]
		}))
		.pipe(eslint.format())
		.pipe(eslint.format('checkstyle', wstream))
		.pipe(eslint.failOnError());

});

gulp.task('lint-tests', function (cb) {
	var wstream = fs.createWriteStream('checkstyle-tests.xml');

	return gulp.src(['tests/**/*.js'])
		.pipe(eslint({
			rules: {
				quotes: 0,
				'no-underscore-dangle': 0,
				'no-mixed-spaces-and-tabs': 1,
				"indent": [2, "tab"]
			},
			envs: [
				'node',
				'mocha',
				'browser'
			]
		}))
		.pipe(eslint.format())
		.pipe(eslint.format('checkstyle', wstream))
		.pipe(eslint.failOnError());

});

// Run as: gulp format --file [file]
// e.g. gulp format --file routes/testroutes.js
gulp.task('format', function() {
	return gulp.src(args.file, {base: './'})
    	.pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
    	.pipe(gulp.dest('./'));
});

gulp.task('liquibase', shell.task([
	'database/db.update.sh gsac gsac123'
]));

