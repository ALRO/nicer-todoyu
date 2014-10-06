'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    zip = require('gulp-zip'),
    pack = require('./package.json');


gulp.task('sass', [], function() {
    gulp.src('./src/*.scss')
        .pipe(sass({
            'outputStyle': 'compressed'
        }))
        .pipe(gulp.dest('./css'));
});

gulp.task('default', ['sass'], function() {
    var zipName = pack.name + "_" + pack.version.replace(/\./g, '-') + ".zip";

    gulp.src(['manifest.json', 'css/*', 'js/*', 'lib/*'], {
        base: '.'
    })
        .pipe(zip(zipName))
        .pipe(gulp.dest('.'));
});