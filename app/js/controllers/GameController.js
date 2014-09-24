define(
    [
        'js/views/GameView',

        'js/controllers/ThreeController',

        'backbone',
        'jquery',
        'underscore'
    ],

    function ( GameView,
               ThreeController,
               Backbone, $, _
            ) {

        /**
         * GameController is the Presenter of the MVP pattern; all changes and
         * consequences are determined by this controller.
         *
         * @param {jQuery} container
         * @param {SoundCloudGameModel} gameModel For now an instance of the
         *                                        SoundCloudGameModel
         * @constructor
         */
        var GameController = function ( container, gameModel ) {

            this._gameModel = gameModel;

            this._gameView = new GameView({
                model : gameModel,
                el : container
            });

            this._bindHandlers();
        };

        GameController.prototype = {

            _bindHandlers : function () {

                // game model
                this._gameModel.on( 'change:status', this._handleGameModelStatusChange, this );

                // view
                this._gameView.on( 'exit', this._handleViewExit, this );
                this._gameView.on( 'play', this._handleViewPlay, this );
                this._gameView.on( 'replay', this._handleViewReplay, this );
                this._gameView.on( 'stop-playing', this._handleViewStopPlaying, this );
            },

            _handleGameModelStatusChange : function ( model, status ) {

                switch ( status ) {

                    case 'lost': case 'won':
                        this._handleGameEnd();
                        break;

                    case 'play':
                        this._handleGamePlay();
                        break;

                    case 'start':
                        this._handleGameStart();
                        break;
                }
            },

            _handleGameEnd : function () {

                this._threeController.cleanUp();
                this._gameView.renderEnd();
            },

            _handleGamePlay : function () {

                this._gameView.renderPlay();

                this._gameModel.setAudioContainer( this._gameView.getAudioPlayerContainer() );

                this._threeController = new ThreeController(
                    this._gameView.getGameContainer(),
                    this._gameModel
                );

                this._threeController.start();
            },

            _handleGameStart : function () {
                this._gameView.renderSplash();
            },

            _handleViewExit : function () {
                this.trigger('exit');
            },

            _handleViewPlay : function () {
                this._gameModel.set( 'status', 'play' );
            },

            _handleViewReplay : function () {
                this._gameModel.set( 'status', 'start' );
            },

            _handleViewStopPlaying : function () {
                this._gameModel.set( 'status', 'lost' );
            },

            start : function () {
                this._gameModel.set( 'status', 'start' );
            }
        };

        _.extend( GameController.prototype, Backbone.Events );

        return GameController;
    }
);