define(
    [
        'js/models/ThreePlayer',
        'three',
        'js/lib/util',
        'backbone',
        'jquery',
        'underscore'
    ],

    function ( ThreePlayer,
               THREE,
               util,
               Backbone, $, _
            ) {

        /**
         * A ThreeJS version of the WaveRider game
         * https://github.com/mrdoob/three.js/
         *
         * @param {jQuery} container
         * @param gameModel
         *
         * @constructor
         */
        var ThreeController = function ( container, gameModel ) {

            this._container = container;
            this._gameModel = gameModel;

            this._animateProxy = $.proxy( this._animate, this );

            this._handleResizeProxy = $.proxy( this._handleResize, this );
            this._handleKeyDownProxy = $.proxy( this._handleKeyDown, this );
            this._handleKeyUpProxy = $.proxy( this._handleKeyUp, this );

            this._bindHandlers();
        };

        ThreeController.prototype = {

            _animate : function () {
                if ( this.playing ) {
                    requestAnimationFrame( this._animateProxy );
                }
                var timer = this._gameModel.get('time');

                this._updatePhysics( timer );
                this._render( timer );
            },

            _bindHandlers : function () {

                // game model
                this._gameModel.on( 'end', this._handleGameModelEnded, this );

                $( window ).on( 'resize', this._handleResizeProxy );
                $( window ).on( 'keydown', this._handleKeyDownProxy );
                $( window ).on( 'keyup', this._handleKeyUpProxy );
            },

            _checkCollisions : function ( player ) {
                var playerPosition = player.getMesh().position;
                var bb = player.getBoundingBox();
                var neighbours = [];

                var closestIdx = Math.ceil((playerPosition.x - this.sceneWidth) / this.meshWidth) - 1;

                if (closestIdx >= -1) {

                    if ( closestIdx === -1 ) {

                        // We are going to hit the first block
                        neighbours = [
                            {
                                min: {
                                    x: this.wavesBb[0].min.x - (this.meshWidth * 2),
                                    y: 0,
                                    z: 0
                                },
                                max: {
                                    x: this.wavesBb[0].min.x - this.meshWidth,
                                    y: 0,
                                    z: 0
                                }
                            },
                            {
                                min: {
                                    x: this.wavesBb[0].min.x - this.meshWidth,
                                    y: 0,
                                    z: 0
                                },
                                max: {
                                    x: this.wavesBb[0].min.x,
                                    y: 0,
                                    z: 0
                                }
                            },
                            this.wavesBb[0]
                        ];

                    } else if ( closestIdx === 0) {

                        // we are on the first block
                        neighbours = [
                            {
                                min: {
                                    x: this.wavesBb[0].min.x - this.meshWidth,
                                    y: 0,
                                    z: 0
                                },
                                max: {
                                    x: this.wavesBb[0].min.x,
                                    y: 0,
                                    z: 0
                                }
                            },
                            this.wavesBb[closestIdx],
                            this.wavesBb[closestIdx + 1]
                        ];

                    } else {
                        if (closestIdx < this.wavesBb.length - 1) {
                            neighbours = [ this.wavesBb[closestIdx - 1],
                                           this.wavesBb[closestIdx],
                                           this.wavesBb[closestIdx + 1]];
                        } else {
                            neighbours = [ this.wavesBb[closestIdx - 1],
                                           this.wavesBb[closestIdx],
                                {
                                    min: {
                                        x: this.wavesBb[closestIdx].max.x,
                                        y: 0,
                                        z: 0
                                    },
                                    max: {
                                        x: this.wavesBb[closestIdx].max.x + this.meshWidth,
                                        y: 0,
                                        z: 0
                                    }
                                }
                            ];
                        }
                    }


                    var prev = neighbours[0],
                            current = neighbours[1],
                            next = neighbours[2];

                    if (bb.min.x < current.min.x) {

                        if (prev.max.y > current.max.y) {

                            if (player.falling) {
                                if (bb.min.y < prev.max.y && bb.max.y > prev.max.y) {
                                    player.land(prev.max.y);
                                }
                            } else if (player.movingLeft() && bb.min.y < prev.max.y - 1) {
                                playerPosition.x = player.meshWidth / 2 + prev.max.x - 2;
                            }

                        } else {

                            if (player.falling) {
                                if (bb.min.y < current.max.y && bb.max.y > current.max.y) {
                                    player.land(current.max.y);
                                }
                            }
                        }

                    } else if (bb.max.x > current.max.x) {

                        if (next.max.y > current.max.y) {

                            if (player.falling) {
                                if (bb.min.y < next.max.y && bb.max.y > next.max.y) {
                                    player.land(next.max.y);
                                }
                            } else if (player.movingRight() && bb.min.y < next.max.y - 1) {
                                playerPosition.x = -player.meshWidth / 2 + next.min.x + 2;
                            }

                        } else {

                            if (player.falling) {
                                if (bb.min.y < current.max.y && bb.max.y > current.max.y) {
                                    player.land(current.max.y);
                                }
                            }
                        }

                    } else {

                        if (player.falling) {
                            if (bb.min.y < current.max.y) {
                                player.land(current.max.y);
                            }
                        } else {
                            if (bb.min.y > current.max.y && !player.jumping) {
                                player.fall();
                            }
                        }
                    }
                }
            },

            cleanUp : function () {

                this._unbindHandlers();

                this._gameModel.stop();
                this.playing = false;
            },


            _createGame : function () {

                var scene,
                      camera,
                      light,
                      renderer,
                      windowWidth = $( window ).width(),
                      windowHeight = $( window ).height(),
                      sceneWidth = 1000,
                      meshWidth = 100;

                scene = new THREE.Scene();
                scene.add( new THREE.AmbientLight(0x404040) );

                camera = new THREE.PerspectiveCamera(22, windowWidth / windowHeight, 100, 10000);
                camera.position.x = sceneWidth * 0.5;
                camera.position.y = 400;
                camera.position.z = 1550;
                camera.lookAt(new THREE.Vector3(camera.position.x, 100, 0));
                scene.add(camera);

                light = new THREE.PointLight(0xffffff, 4, 3000);
                light.position.x = 1000;
                light.position.y = 1000;
                light.position.z = 500;
                scene.add(light);

                renderer = new THREE.WebGLRenderer({
                    antialias: true
                });
                renderer.setClearColor( 0xCADBDF, 1 );
                renderer.setSize( windowWidth, windowHeight );

                this._container[0].appendChild( renderer.domElement );

                this.camera = camera;
                this.light = light;
                this.meshWidth = meshWidth;
                this.renderer = renderer;
                this.scene = scene;
                this.sceneWidth = sceneWidth;
                this.windowWidth = windowWidth;
                this.windowHeight = windowHeight;

                this._createFloor();
                this._createPlayer();

            },

            _createFloor : function () {
                this.platform = new THREE.Mesh( new THREE.BoxGeometry( 1000, 1, 100 ), new THREE.MeshLambertMaterial( { color: 0x202020 } ) );
               this.platform.position.y = -1;
               this.platform.position.x = this.sceneWidth / 2;

               this.scene.add( this.platform );

               this.beginColumn = new THREE.Mesh(
                   this.geometry,
                   new THREE.MeshLambertMaterial( { color: 0xFF0000 } )
               );

               this.beginColumn.scale.x = this.beginColumn.scale.y = this.beginColumn.scale.z = 100;
               this.beginColumn.position.x = 0 - ( this.meshWidth / 2 );
               this.beginColumn.position.z = 0;
               this.beginColumn.position.y = - 30;

               this.endColumn = new THREE.Mesh(
                   this.geometry,
                   new THREE.MeshLambertMaterial( { color: 0xFF0000 } )
               );

               this.endColumn.scale.x = this.endColumn.scale.y = this.endColumn.scale.z = 100;
               this.endColumn.position.x = this.sceneWidth + ( this.meshWidth / 2 );
               this.endColumn.position.z = 0;
               this.endColumn.position.y = - 30;

               //this.scene.add( this.beginColumn );
               //this.scene.add( this.endColumn );
            },

            _createPlayer : function () {
                this.player = new ThreePlayer();

                this.player.getMesh().position.set(
                    300,
                    200,
                    0
                );

                this.player.fall();

                this.scene.add( this.player.getMesh() );
            },

                // this means the user has reached the end of the audio, jeejj
            _handleGameModelEnded : function () {
                this._gameModel.set( 'status', 'won' );
            },

            _handleKeyDown : function ( e ) {
                
                switch ( e.keyCode ) {

                    case 38:
                        if ( ! this.keyState.up ) {
                            this.keyState.up = true;
                        }
                        break;

                    case 37:
                        if ( ! this.keyState.left ) {
                            this.keyState.left = true;
                        }
                        break;
                    
                    case 39:
                        if( ! this.keyState.right ) {
                            this.keyState.right = true;
                        }
                        break;
                }
            },

            _handleKeyUp : function ( e ) {
                
                switch ( e.keyCode ) {

                    case 38:
                        this.keyState.up = false;
                        break;

                    case 37:
                        this.keyState.left = false;
                        break;

                    case 39:
                        this.keyState.right = false;
                        break;
                }
            },

            _handleResize : function () {

                this.windowWidth = $( window ).width();
                this.windowHeight = $( window ).height();

                this.renderer.setSize( this.windowWidth, this.windowHeight );
                this.camera.aspect = this.windowWidth / this.windowHeight;
                this.camera.updateProjectionMatrix();
            },

            _lost : function () {
                this._gameModel.set( 'status', 'lost' );
            },

            _render : function ( timer ) {

                this._renderWaveForm( timer, this.scene );

                this.beginColumn.position.x = timer * this.meshWidth - this.meshWidth / 2;
                this.endColumn.position.x = timer * this.meshWidth + this.sceneWidth + this.meshWidth / 2;
                this.camera.position.x = this.light.position.x = timer * this.meshWidth + this.sceneWidth / 2;

                this.renderer.render( this.scene, this.camera );
            },

            _renderWaveForm : function ( timer, scene ) {
                var seconds = Math.floor( timer );
                var mesh;

                if( seconds !== this.secondsDrawn ){

                    var add = 1,
                        offset = seconds + 2;

                    this.secondsDrawn = seconds;
                    if(seconds === 0){
                        // draw 3 seconds for the start screen
                        add = 3;
                        offset = 0;
                    }

                    for ( var i = offset; i < offset+add; i++ ) {
                        if( i < this.waveFormData.length ){

                            var color = 0x202020;

                            mesh = this.waves[ i ] = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshLambertMaterial( { color: color } ) );

                            var scale = Math.abs( this.waveFormData[i] );
                                scale = (scale === 0 || isNaN(scale))? 1 : (scale > 450)? 450 : scale;
                            mesh.scale.x = mesh.scale.z = 100;
                            mesh.scale.y = scale;
                            mesh.position.set( (i * this.meshWidth + this.sceneWidth + (this.meshWidth / 2)), 0, 0 );

                            scene.add( mesh );

                            if( ! mesh.geometry.boundingBox ){
                                mesh.geometry.computeBoundingBox();
                            }
                            var bb = mesh.geometry.boundingBox;

                            this.wavesBb.push({
                                max: {
                                    x: mesh.position.x + 50,
                                    y: mesh.position.y + (bb.max.y * scale),
                                    z: mesh.position.z + 50
                                },
                                min: {
                                    x: mesh.position.x - 50,
                                    y: mesh.position.y + (bb.min.y * scale),
                                    z: mesh.position.z + 50
                                }
                            });
                        }
                    }
                }
            },

            _setGameStartValues : function () {
                
                this.geometry = new THREE.BoxGeometry( 1, 1, 1 );
                this.keyState = {
                    left: false,
                    up: false,
                    right: false
                };
                this.playing = false;
                this.secondsDrawn  = -1;
                this.waves = [];
                this.wavesBb = [];
                this.waveFormData = this._gameModel.get('waveFormData');
            },

            start : function () {

                this._setGameStartValues();
                this._createGame();
                this._startGame();
            },

            _startGame : function () {

                this._gameModel.play();

                this.playing = true;
                this._animate();
            },

            _unbindHandlers : function () {

                this._gameModel.off( 'end' );

                $( window ).unbind( 'resize', this._handleResizeProxy );
                $( window ).unbind( 'keydown', this._handleKeyDownProxy );
                $( window ).unbind( 'keyup', this._handleKeyUpProxy );
            },

            _updatePhysics : function ( timer ) {

                if( this.keyState.up ) {
                    this.player.jump();
                }

                if ( this.keyState.right ) {
                    this.player.moveRight( );
                }else{
                    this.player.stopRight();
                }

                if ( this.keyState.left ) {
                    this.player.moveLeft();
                }else{
                    this.player.stopLeft();
                }

                this.player.update();

                this._checkCollisions( this.player );


                var bb = this.player.getBoundingBox();

                if( bb.max.x < this.camera.position.x - ( this.sceneWidth / 2 ) - 150 ){
                    this._lost();
                }

                if( bb.min.y <= 0 && this.player.falling ) {
                    this.player.land( 0 );
                }
            }
        };

        _.extend( ThreeController.prototype, Backbone.Events );

        return ThreeController;
    }
);