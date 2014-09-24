var express = require('express');
var pathUtil = require('path');

exports.notifyLivereload = function( basePath, livereload, event ) {

    // `gulp.watch()` events provide an absolute path
    // so we need to make it relative to the server root
    var fileName = pathUtil.relative( basePath, event.path );

    livereload.changed( fileName );
};

exports.startExpress = function( basePath, port ) {

    var app = express();
    var usedPort = port || 4000;

    app.use( express.static( basePath ) );
    app.listen( usedPort );

    console.log( 'express server started on localhost:'+ usedPort );
};