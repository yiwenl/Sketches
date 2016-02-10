const gulp        = require('gulp');
const babel       = require('gulp-babel');
const sourcemaps  = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const browserify  = require('browserify');
const babelify    = require('babelify');
const source      = require('vinyl-source-stream2')
const uglify      = require('gulp-uglify');
const sass        = require('gulp-ruby-sass');
const prefix      = require('gulp-autoprefixer');
const watchify    = require('watchify');
const buffer      = require('vinyl-buffer');
const reload      = browserSync.reload;

var bundler = watchify(browserify('./src/js/app.js', watchify.args));
bundler.transform(babelify);
gulp.task('browserify', bundle);

bundler.on('update', bundle);     

function logError(msg) {
	console.log( msg.toString() );
}

function bundle() {
    var b = bundler.bundle()
	.on('error', logError)
	.pipe(source('bundle.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({ loadMaps: true }))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest('./dist/bundle/'))
	.pipe(reload({stream: true, once: true}));

    return b;
}


gulp.task('watch', function() {
	gulp.watch('./src/scss/*.scss', ['sass']);
});


gulp.task('sass', function() {
	return sass('./src/scss/main.scss') 
	.on('error', function (err) {
	  console.error('Error!', err.message);
	})
	.pipe(prefix({
			browsers: ['last 2 versions'],
			cascade: false
		}))
	.pipe(gulp.dest('./dist/css'))
	.pipe(reload({stream:true}));
});

gulp.task('browser-sync', function() {
	browserSync.init({
	    browser: 'google chrome',
	    server: {
	      baseDir: './dist/'
	    },
	    files: [
	      './dist/js/bundle.js',
	      './dist/css/main.css',
	      './dist/index.html'
	    ],
	    // open: false,
	    // port: '8000',
	    reloadDebounce: 500
	  });
});

gulp.task('default', ['browserify', 'sass', 'browser-sync', 'watch']);

/*
gulp.task('default', function () {
    return gulp.src('src/js/app.js')
        .pipe(babel())
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});
*/