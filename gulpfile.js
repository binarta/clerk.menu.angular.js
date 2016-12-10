var gulp = require('gulp'),
    minifyHtml = require('gulp-minify-html'),
    template = require('gulp-template'),
    templateCache = require('gulp-angular-templatecache');

var minifyHtmlOpts = {
    empty: true,
    cdata: true,
    conditionals: true,
    spare: true,
    quotes: true
};

gulp.task('clerk-menu', function () {
    gulp.src('template/*.html')
        .pipe(template({shop: false}))
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('clerk-menu-tpls.js', {standalone: true, module: 'clerk.menu.templates'}))
        .pipe(gulp.dest('src'));
});

gulp.task('clerk-menu-shop', function () {
    gulp.src('template/*.html')
        .pipe(template({shop: true}))
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('clerk-menu-shop-tpls.js', {standalone: true, module: 'clerk.menu.templates'}))
        .pipe(gulp.dest('src'));
});

gulp.task('default', ['clerk-menu', 'clerk-menu-shop']);