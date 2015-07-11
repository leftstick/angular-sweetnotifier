'use strict';

var gulp = require('gulp');

var less = function(dest) {
    var less = require('gulp-less');
    var LessPluginAutoPrefix = require('less-plugin-autoprefix');
    var autoprefix = new LessPluginAutoPrefix({
        browsers: [
            'last 5 versions'
        ],
        cascade: true
    });
    var LessPluginCleanCSS = require('less-plugin-clean-css');
    var cleancss = new LessPluginCleanCSS({advanced: true});
    var rename = require('gulp-rename');

    return gulp.src('./src/angular-sweetnotifier.less')
        .pipe(less({plugins: [autoprefix,cleancss]}))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest(dest));

};

gulp.task('lessDemo', function() {
    return less('demo/');
});

gulp.task('lessDist', function() {
    return less('dist/');
});

gulp.task('fontsDemo', function() {
    return gulp.src([
        './src/sweetnotifier.*',
        '!./src/sweetnotifier.less'
    ])
        .pipe(gulp.dest('./demo/'));
});

gulp.task('fontsDist', function() {
    return gulp.src([
        './src/sweetnotifier.*',
        '!./src/sweetnotifier.less'
    ])
        .pipe(gulp.dest('./dist'));
});

var js = function(dest) {
    var fs = require('fs');
    var template = require('gulp-template');
    return gulp.src('src/angular-sweetnotifier.js')
        .pipe(template({
            template: fs.readFileSync('./src/angular-sweetnotifier.html', {
                encoding: 'utf-8'
            }).replace(/(\r\n|\n|\r)/gm, '')
        }))
        .pipe(gulp.dest(dest));
};

gulp.task('jsDemo', function() {
    return js('./demo/');
});

gulp.task('jsDist', function() {
    return js('./dist/');
});

gulp.task('dev', ['lessDemo', 'jsDemo', 'fontsDemo'], function() {
    var webserver = require('gulp-webserver');
    gulp.src('demo/')
        .pipe(webserver({
            host: '0.0.0.0',
            port: 8080,
            livereload: true,
            directoryListing: false,
            fallback: 'index.html'
        }));
});

gulp.task('dist', ['lessDist', 'jsDist', 'fontsDist'], function() {
    var uglify = require('gulp-uglify');
    var rename = require('gulp-rename');

    return gulp.src('./dist/angular-sweetnotifier.js')
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('./dist/'));
});
