
requirejs.config({
    paths : {
        'backbone' : 'vendor/backbone',
        'handlebars' : 'vendor/handlebars',
        'jquery' : 'vendor/jquery.min',
        'soundcloud' : 'vendor/player-api-amd',
        'swfobject' : 'vendor/swfobject',
        'three' : 'vendor/three.min',
        'underscore' : 'vendor/underscore'
    },
    shim : {
        'handlebars' : {
            exports : 'Handlebars'
        },
        'swfobject' : {
            exports : 'swfobject'
        },
        'three' : {
            exports : 'THREE'
        }
    }
});

require(
    [
        'js/controllers/AppController'
    ],

    function ( AppController ) {

        var app = new AppController( document.getElementById('app') );
    }
);