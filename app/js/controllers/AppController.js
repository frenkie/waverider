define(
    [
        'js/collections/GameServices',

        'js/controllers/GameController',

        'js/views/IntroView',
        'js/views/PreloadView',

        'js/lib/util',

        'jquery',
        'underscore'    
    ],

    function ( GameServices,
               GameController,
               IntroView, PreloadView,
               util,
               $, _
            ) {

        var AppController = function ( container ) {

            this._container = $( container );

            this._introView = new IntroView({
                el: this._container
            });

            if ( util.isSupported() ) {
                this._gameServices = new GameServices();
                this._expectedServices = 0;

                this._preloadView = new PreloadView({
                    el: this._container
                });

                this._bindHandlers();

                this._loadConfig();

            } else {
                this._showIntroUnsported();
            }
        };

        AppController.prototype = {

            _bindGameControllerHandlers : function () {
                this._activeGameController.on( 'exit', this._handleGameControllerExit, this );
            },

            _bindGameModelHandlers : function () {
                this._activeGameModel.on( 'change:loaded', this._handleGameModelLoaded, this );
            },

            _bindHandlers : function () {

                this._gameServices.on( 'add', this._checkServicesProgress, this );
                this._gameServices.on( 'gamemodel:chosen', this._handleGameModelChosen, this );

                this._introView.on( 'search', this._handleSearch, this );
                this._introView.on( 'search-result', this._handleSearchResult, this );
            },

            _checkServicesProgress : function () {
                if ( this._gameServices.length === this._expectedServices ) {

                    this._showIntro();
                }
            },

            _handleGameControllerExit : function () {

                this._activeGameController.off();

                this._showIntro();
            },

            _handleGameModelChosen : function ( gameService, gameModel ) {

                if ( this._activeGameModel ) {
                    this._activeGameModel.off();
                }

                this._activeGameModel = gameModel;

                this._bindGameModelHandlers();

                this._preloadView.render( this._activeGameModel );

                gameService.preloadGameModel( this._activeGameModel );
            },

            _handleGameModelLoaded : function () {

                this._activeGameController = new GameController( this._container, this._activeGameModel );

                this._bindGameControllerHandlers();

                this._activeGameController.start();
            },

            _handleSearch : function ( query ) {

                var resultsLoaded = 0;

                this._introView.clearSearchResults();
                this._introView.setLoadingState( true );

                _.each( this._gameServices.models, _.bind(function ( service ) {

                    service.search( query ).done( _.bind(function ( searchResults ) {

                        resultsLoaded++;
                        if ( resultsLoaded === this._expectedServices ) {
                            this._introView.setLoadingState( false );
                        }

                        this._introView.renderSearchResults( service, searchResults );
                    },this) );

                },this));
            },

            _handleSearchResult : function ( serviceId, resultId ) {

                this._gameServices.get( serviceId ).chooseGameModel( resultId );
            },

            _loadConfig : function () {
                $.getJSON('config.json').done( this._parseConfig.bind(this) );
            },

            _parseConfig : function ( cfg ) {

                var services = [];

                this._config = cfg;

                _.each( cfg.services, function ( service ) {

                    services.push( 'js/services/'+ service.module );
                });

                this._expectedServices = services.length;

                require( services, this._parseServices.bind(this) );
            },

            /**
             * arguments are the loaded Services modules
             */
            _parseServices : function () {

                _.each( arguments, function ( Service ) {

                    var service = new Service();
                        service.setConfig( this._config.services[ service.id ].config );

                    this._gameServices.add( service );

                }.bind(this) );
            },

            _showIntro : function () {

                this._introView.render( _.map( this._gameServices.models, function ( service ) {
                         return ({
                             id : service.id,
                             title : service.title
                         });
                    })
                );
            },

            _showIntroUnsported : function () {

                this._introView.renderUnsupported();
            }
        };

        return AppController;
    }
);