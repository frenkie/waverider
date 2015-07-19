define(
    [
        'js/collections/SearchResults',
        'js/models/SoundCloudGameModel',
        'js/lib/FormatDuration',
        'backbone',
        'jquery'
    ],

    function ( SearchResults, SoundCloudGameModel, FormatDuration, Backbone, $ ) {

            // services extend Model to inherit
            // things like toJSON
            // needed when outputting a service
            // in a template
        var SoundCloudService = Backbone.Model.extend({

            id : 'soundcloud',
            title : 'SoundCloud',

            chooseGameModel : function ( resultId ) {

                var searchResult = this.searchResults.get( resultId );

                var gameModel = new SoundCloudGameModel( searchResult.toJSON() );

                this.trigger( 'gamemodel:chosen', this, gameModel );
            },

            initialize : function () {

                this.searchResults = new SearchResults();
            },

            _loadWaveFormData : function ( waveFormUrl ) {

                return $.getJSON( 'http://www.waveformjs.org/w?callback=?&url='+
                    waveFormUrl
                );
            },

            _parseSearchResults : function ( results ) {

                _.each( results, function ( result ) {

                    this.searchResults.add({
                        id : result.id,
                        title : result.title,
                        duration : (new FormatDuration( result.duration ) ).getMinutesSeconds(),
                        data : result
                    });

                }.bind(this) );

                return this.searchResults;
            },

            preloadGameModel : function ( gameModel ) {

                this._loadWaveFormData( gameModel.getWaveFormUrl() )
                    .then(function ( waveFormData ) {

                        gameModel.setWaveFormData( waveFormData );
                        gameModel.set( 'loaded', true );

                    }.bind(this) );
            },

            search : function ( query ) {

                var deferred = new $.Deferred();

                this.searchResults.reset();

                if ( ! this.SoundCloud ) {

                    require( ['http://connect.soundcloud.com/sdk.js'], function () {

                        this.SoundCloud = window.SC;
                        this.SoundCloud.initialize({
                            client_id: this.config.apiKey
                        });

                        this._searchService( query, deferred.resolve );

                    }.bind(this) );

                } else {
                    this._searchService( query, deferred.resolve );
                }

                return deferred.promise();
            },

            _searchService : function ( query, callback ) {

                this.SoundCloud.get('/tracks/', {
                    'q': query,
                    'limit': 10,
                    'duration[to]': 500000
                    },
                    function ( data ){
                        callback( this._parseSearchResults( data ) );
                    }.bind(this)
                );
            },

            setConfig : function ( config ) {
                this.config = config;
            }
        });

        return SoundCloudService;
    }
);