'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass');

gulp.task('sass', [], function() {
    gulp.src('./src/*.scss')
        .pipe(sass({
            'outputStyle': 'compressed'
        }))
        .pipe(gulp.dest('./css'));
});

gulp.task('default', ['sass'], function() {

});