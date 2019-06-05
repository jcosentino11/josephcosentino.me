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
var browsersync = require('browser-sync').create();


function watch () {
	gulp.watch('app/scss/**/*.scss', gulp.series(convertSass, minify, browserSyncReload));
	gulp.watch('app/*.html', browserSyncReload);
	gulp.watch('app/js/**/*.js', gulp.series(lint, minify, browserSyncReload));
}

function browserSync (done) {
	browsersync.init({
		server: {
			baseDir: 'app'
		}
	});
	done();
}

function browserSyncReload (done) {
	browsersync.reload();
	done();
}

function convertSass () {
	return gulp
		.src('app/scss/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('app/css'))
		.pipe(browsersync.stream());
}

function lint () {
	return gulp
		.src(['app/js/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
}

// CSS and JS Optimization

function minify () {
	return gulp
		.src('app/*.html')
		.pipe(useref())
		.pipe(gulpIf('*.js', uglify()))
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('dist'));
}

// Image Optimization

function images () {
	return gulp
		.src('app/images/**/*.+(png|jpg|gif|svg)')
		.pipe(cache(imagemin()))
		.pipe(gulp.dest('dist/images'));
}

// Copy Fonts

function fonts () {
	return gulp
		.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));
}

// Cleaning

function cleanDist () {
	return del('dist');
}

function clearCache () {
	return cache.clearAll(callback);
}

// cleanup
gulp.task("clearCache", clearCache);
gulp.task("clean", cleanDist);

// build
gulp.task(
	"build", 
	gulp.series(
		cleanDist, 
		gulp.parallel(lint, images, fonts, gulp.series(convertSass, minify))
	)
);

// watch
gulp.task("watch", gulp.parallel(watch, browserSync));