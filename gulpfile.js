var gulp = require('gulp');


var del = require('del'),
    helpers = require('./lib/helpers'),
    plugins = require('gulp-load-plugins')();

var basePath = __dirname +'/app/';

gulp.task('clean', function (cb) {
    del( basePath +'vendor', cb);
});

gulp.task('install', ['vendor', 'sass']);

// Concatenate & Minify SCSS
gulp.task('sass', function ( cb ) {
    gulp.src( __dirname +'/src/sass/waverider.scss' )
        .pipe( plugins.rubySass({ unixNewlines: true, precision: 4, noCache: true }) )
        .pipe( plugins.autoprefixer('last 2 version', '> 1%', 'ie 9', { cascade: true }) )
        .pipe( gulp.dest( basePath + 'css/' ) )
        .pipe( plugins.rename({ suffix: '.min' }) )
        .pipe( plugins.minifyCss() )
        .pipe( gulp.dest( basePath +'css/' ) )
        .on('end', cb);
});


gulp.task('serve', function ( cb ) {
    helpers.startExpress( basePath );
    cb();
});

gulp.task('vendor', ['clean'], function ( cb ) {

    var vendorSrc = __dirname +'/bower_components/';

    gulp.src([
        vendorSrc +'backbone-amd/backbone.js',
        vendorSrc +'handlebars/handlebars.js',
        vendorSrc +'jquery/jquery.min.js',
        vendorSrc +'requirejs/require.js',
        vendorSrc +'swfobject/swfobject/swfobject.js',
        vendorSrc +'threejs/build/three.min.js',
        vendorSrc +'underscore-amd/underscore.js'
    ])
        .pipe( gulp.dest( basePath +'vendor' ) )
        .on('end', cb);
});

gulp.task('watch', function () {

    helpers.startExpress( basePath );

    plugins.livereload.listen();

    // Watch for changes to our SASS
    gulp.watch( 'src/sass/**/*.scss', ['sass'] );


    // Watch for CSS or JS changes in our build
    gulp.watch( [ basePath + 'css/waverider.css', basePath + 'js/**/*', basePath + 'templates/*' ] )
        .on('change', helpers.notifyLivereload.bind( this, basePath, plugins.livereload ) );
});


// Default Task
gulp.task('default', ['sass']);