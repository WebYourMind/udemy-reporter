var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var babel = require("gulp-babel");
var fs = require('fs');
//var s3 = require("gulp-s3");
//var ftpcredentials = JSON.parse(fs.readFileSync('./ftpcredentials.json'));
var concat = require('gulp-concat');
var del = require('del');
var uglify = require('gulp-uglify');
var jsdoc = require('gulp-jsdoc3');
var useref = require('gulp-useref');
var gulpMinifyCss = require('gulp-clean-css');
var gulpif = require('gulp-if');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var optipng = require('imagemin-optipng');
var reload = browserSync.reload;

// watch files for changes and reload
gulp.task('default', ['serve']);
gulp.task('build', ['clean:dist', 'fonts', 'html', 'data', 'img', 'svg','favicon']);
gulp.task('deployonly', function() {
    return gulp.src('./dist/**')
    .pipe(sftp(ftpcredentials));
});
gulp.task('serve', function() {
    browserSync.init({
        files: ['*.html', 
                'partials/*.html',
                'css/*.css', 
                'js/*.js', 
                'reports/*.js', 
                'reports/*.html', 
                'services/*.js'
               ],
        server: {
            baseDir: './'
        },
        logLevel: "debug"
    });
});
gulp.task('clean:dist', function() {
    return del(['dist/']);
});
gulp.task('fonts', ['clean:dist'], function() {
    return gulp.src(['./bower_components/font-awesome/fonts/fontawesome-webfont.*'])
        .pipe(gulp.dest('dist/fonts/'));
});
gulp.task('img', ['clean:dist'], function() {
    return gulp.src(['./img/*.png'])
   .pipe(imagemin({
            svgoPlugins: [{removeViewBox: false}],
            use: [optipng({optimizationLevel:7})]
        }))
    .pipe(gulp.dest('dist/img'))
});

gulp.task('svg',['clean:dist'], function() {
      return gulp.src(['./img/*.svg'])
      .pipe(gulp.dest('dist/img'))
});
gulp.task('data', ['clean:dist'], function() {
    return gulp.src('./data/*.*')
        .pipe(gulp.dest('dist/data/'));
});
gulp.task('html', ['clean:dist'], function() {
    return gulp.src(['./index*.html','./*/*.html'])
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', gulpMinifyCss()))
        //.pipe(babel())
        .pipe(gulp.dest('./dist'));
});
gulp.task('favicon', ['clean:dist'], function() {
      return gulp.src('favicon.ico').pipe(gulp.dest('./dist'))
});
gulp.task('doc', function(cb) {
    gulp.src(['README.md', './js/*.js'], {
            read: false
        })
        .pipe(jsdoc(cb));
});