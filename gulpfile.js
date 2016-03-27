var gulp = require('gulp');
var react = require('gulp-react');

var path = {
  JSX: ['app/view/react/*.jsx'],
  DEST_JSX: 'app/view/ui/'
};

gulp.task('transform', function(){
  gulp.src(path.JSX)
    .pipe(react())
    .pipe(gulp.dest(path.DEST_JSX));
});

gulp.task('watch', function(){
  gulp.watch(path.JSX, ['transform']);
});

gulp.task('default', ['watch']);