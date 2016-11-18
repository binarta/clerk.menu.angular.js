var gulp = require('gulp'),
    minifyHtml = require('gulp-minify-html'),
    templateCache = require('gulp-angular-templatecache');

var minifyHtmlOpts = {
    empty: true,
    cdata: true,
    conditionals: true,
    spare: true,
    quotes: true
};

gulp.task('default', function () {
    gulp.src('template/*.html')
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('clerk-menu-tpls.js', {standalone: true, module: 'clerk.menu.templates'}))
        .pipe(gulp.dest('src'));
});