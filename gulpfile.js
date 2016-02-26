var gulp = require('gulp');
var browserify = require('gulp-browserify');

gulp.task('bundle', function() {
  gulp.src('./app/main.js')
    .pipe(browserify({
      insertGlobals: true,
      debug: true,
      ignore: 'remote'
    }))
    .pipe(gulp.dest('./webapp'));
  gulp.src('./app/main.js')
    .pipe(browserify({
      insertGlobals: true,
      debug: true,
      ignore: 'remote'
    }))
    .pipe(gulp.dest('./server/res'));
});

gulp.task('bundle-server', function() {
  gulp.src('./server/src/display.js')
    .pipe(browserify({
      insertGlobals: true,
      debug: true,
      ignore: 'remote'
    }))
    .pipe(gulp.dest('./server/res'));
});

gulp.task('mirror', function() {
  gulp.src('./app/index.html')
    .pipe(gulp.dest('./webapp'));
  gulp.src('./app/res/**')
    .pipe(gulp.dest('./webapp/res'));

  gulp.src('./app/index.html')
    .pipe(gulp.dest('./server/res'));
  gulp.src('./app/res/**')
    .pipe(gulp.dest('./server/res'));
  gulp.src('./app/core/**')
    .pipe(gulp.dest('./server/core'));
});

gulp.task('watch', function() {
  gulp.watch('app/*.js', ['bundle', 'bundle-server']);
  gulp.watch('app/*.html', ['mirror']);
  gulp.watch('app/res/*.*', ['mirror']);
  gulp.watch('app/core/*.*', ['mirror']);
  gulp.watch('server/src/*.js', ['bundle-server']);
});

gulp.task('default', ['bundle', 'mirror', 'bundle-server', 'watch']);