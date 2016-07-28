var gulp = require('gulp'),
	less = require('gulp-less'),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat'),
	minifycss = require('gulp-minify-css'),
	connect = require('gulp-connect'),
	livereload = require('gulp-livereload'),
	uglify = require('gulp-uglify'),
	clean = require('gulp-clean'),
	rev = require('gulp-rev'),
	revCollector = require('gulp-rev-collector');

var browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	dependify = require('dependify'),
	babelify = require('babelify'),
	watchify = require('watchify');

gulp.task('clean', function(){
	return gulp.src(['public/scripts/*.js', 'public/styles/*.css'])
		.pipe(clean());
});

gulp.task('less', function() {
    return gulp.src(['src/less/*.less', 'public/lib/normalize.css'])
		.pipe(concat('common.min.less'))
		.pipe(less())
		.pipe(autoprefixer({
			browsers: ['last 3 versions', 'Android >= 4.0', 'Firefox >= 20'],
			cascade: true,
			remove: true,
		}))
		.pipe(minifycss())
		.pipe(rev())
		.pipe(gulp.dest('public/styles'))
		.pipe(rev.manifest())
		.pipe(gulp.dest('src/rev/styles'))
		.pipe(livereload());
});

// var b = browserify({
// 		entries: 'src/scripts/main.js'
// 	})
// 	.plugin(dependify, {
// 		name: 'QA',
// 		deps: {
// 			'jQuery': 'jquery',
// 		}
// 	})
// 	// 使用babel转换es6代码
// 	.transform(babelify, {
// 		presets: 'es2015', // 分别是 转换ES6、转换JSX
// 		plugins: ['transform-es2015-classes', 'transform-es2015-modules-commonjs'] // es6 class 和 module插件
// 	});
// function bundle() {
// 	return b.bundle()
// 		.pipe(source('bundle.min.js'))
// 		.pipe(buffer())
// 		// .pipe(uglify())
// 		.pipe(gulp.dest('public/scripts'))
// 		.pipe(livereload());
// }
// gulp.task('build-js', bundle);

gulp.task('build-js', function (){
	return gulp.src(['./public/lib/zepto.min.js', './src/scripts/*.js'])
		.pipe(concat('common.js'))
		.pipe(rev())
		.pipe(gulp.dest('./public/scripts'))
		.pipe(rev.manifest())
		.pipe(gulp.dest('src/rev/scripts'))
		.pipe(livereload());
});

gulp.task('connect', function() {
	connect.server({
		root: './',
		livereload: true
	});
});

gulp.task('watch-html', function() {
	return gulp.src('src/html/*.html')
		.pipe(livereload());
});

gulp.task('rev', function (){
	return gulp.src(['src/rev/**/*.json', 'views/index.xtpl'])
		.pipe(revCollector({
			replaceReved: true
		}))
		.pipe(gulp.dest('views'));
});

gulp.task('watch', function() {
	livereload.listen();
	gulp.watch('src/less/*.less', ['less', 'rev']);
	gulp.watch('src/html/*.html', ['watch-html']);
	gulp.watch('src/scripts/*.js', ['build-js', 'rev']);
	// b.plugin(watchify)
	// 	.on('update', function(ids){
	// 		gulp.start('build-js');
	// 	});
});

gulp.task('default', ['clean','less', 'build-js', 'connect', 'rev', 'watch']);