// gulpfile.js

'use strict';

var gulp        = require('gulp');
var sass        = require('gulp-ruby-sass');
var prefix      = require('gulp-autoprefixer');

gulp.task('watch', function() {
	gulp.watch('./scss/*.scss', ['sass']);
});

gulp.task('sass', function() {
	return sass('./scss/main.scss') 
	.on('error', function (err) {
	  console.error('Error!', err.message);
	})
	.pipe(prefix({
			browsers: ['last 2 versions'],
			cascade: false
		}))
	.pipe(gulp.dest('./css'));
	// .pipe(reload({stream:true}));
});

gulp.task('default', ['sass', 'watch']);