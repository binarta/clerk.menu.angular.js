var gulp = require('gulp'),
    less= require('gulp-less'),
    path = require('path'),
    autoprefixer = require('gulp-autoprefixer');

gulp.task('less', function () {
    gulp.src('less/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('css'));
});