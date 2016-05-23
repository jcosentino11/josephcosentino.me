/* eslint-env node */
var gulp = require('gulp');
var sass = require('gulp-sass');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var eslint = require('gulp-eslint');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();


// Build Sequences
// -----------------

gulp.task('default', function (callback) {
	runSequence(['watch', 'sass', 'lint', 'browserSync'],
		callback
	);
});

gulp.task('build', function (callback) {
	runSequence(['clean:dist', 'sass', 'lint'],
		['useref', 'images', 'fonts'],
		callback
	);
});


// Development Tasks
// -----------------

gulp.task('watch', function() {
	gulp.watch('app/scss/**/*.scss', ['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: 'app'
		}
	});
});

gulp.task('sass', function() {
	return gulp.src('app/scss/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('lint', function() {
	return gulp.src(['app/js/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

// Optimization Tasks
// ------------------

// CSS and JS Optimization

gulp.task('useref', function() {
	return gulp.src('app/*.html')
		.pipe(useref())
		.pipe(gulpIf('*.js', uglify()))
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('dist'));
});

// Image Optimization

gulp.task('images', function() {
	return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
		.pipe(cache(imagemin()))
		.pipe(gulp.dest('dist/images'));
});

// Copy Fonts

gulp.task('fonts', function() {
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));
});

// Cleaning

gulp.task('clean:dist', function() {
	return del.sync('dist');
});

gulp.task('cache:clear', function(callback) {
	return cache.clearAll(callback);
});
