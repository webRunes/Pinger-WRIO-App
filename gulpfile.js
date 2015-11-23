/**
 * Created by michbil on 23.11.15.
 */

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

function restart_nodemon () {
    if (nodemon_instance) {
        console.log("Restarting nodemon");
        nodemon_instance.emit('restart');
    } else {
        console.log("Nodemon isntance not ready yet")
    }

}

gulp.task('babel-server', function() {
    restart_nodemon();
});

var nodemon_instance;

gulp.task('nodemon', function() {

    if (!nodemon_instance) {
        nodemon_instance = nodemon({
            script: 'server.js',
            watch: 'src/__manual_watch__',
            ext: '__manual_watch__',
            verbose: false,
        }).on('restart', function() {
            console.log('~~~ restart server ~~~');
        });
    } else {
        nodemon_instance.emit('restart');
    }

});

gulp.task('default', ['babel-server']);

gulp.task('watch', ['default', 'nodemon'], function() {
    gulp.watch(['./**/*.js'], ['babel-server']);
});