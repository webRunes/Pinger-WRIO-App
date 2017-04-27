/**
 * Created by michbil on 23.11.15.
 */
require ('babel-core/register');
require('regenerator-runtime/runtime');

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');
var babel = require('gulp-babel');
var babelify = require('babelify');
var webpack = require('webpack');

function restart_nodemon () {
    if (nodemon_instance) {
        console.log("Restarting nodemon");
        nodemon_instance.emit('restart');
    } else {
        console.log("Nodemon isntance not ready yet")
    }

}

gulp.task('test', function() {
    return gulp.src('test/**/*.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({
            reporter: 'dot',
            timeout: 20000
        }))
        .once('error', function (err) {
            console.log("Tests failed",err);
            process.exit(1);
        })
        .once('end', function () {
            process.exit();
        });
});

gulp.task('lint', function () {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['./src/**/*.js*'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});



gulp.task('babel-server', function() {


    return gulp.src(['src/**/*.*',"!src/views/**.*"])
        .pipe(babel())
        .on('error', function(err) {
            console.log('Babel server:', err.toString());
        })
        .pipe(gulp.dest('app/'))
        .on('end',function() {
            restart_nodemon();
        });
});

gulp.task('client', (callback)=>{

    gulp.src('src/views/**/*.*')
        .pipe(gulp.dest('app/views'));
    return  webpack(require('./webpack.config.js'),
        function(err, stats) {
            if(err) throw new gutil.PluginError("webpack", err);
            console.log("[webpack]", stats.toString({
                // output options
            }));
            callback();
        });
});

var nodemon_instance;

gulp.task('nodemon', function() {

    if (!nodemon_instance) {
        nodemon_instance = nodemon({
            script: 'server.js',
            watch: 'src/__manual_watch__',
            ext: '__manual_watch__',
            verbose: false
        }).on('restart', function() {
            console.log('~~~ restart server ~~~');
        });
    } else {
        nodemon_instance.emit('restart');
    }

});

gulp.task('default', ['lint','babel-server','client']);

gulp.task('watch', ['default', 'nodemon'], function() {
    gulp.watch(['./src/**/*.js','!./src/clientjs/*.js'], ['babel-server']);
    gulp.watch(['./src/clientjs/*.js','./src/views/*.ejs'], ['client']);
});