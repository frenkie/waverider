define(
    [
        'backbone',
        'js/lib/template!templates/game-end.html',
        'js/lib/template!templates/game-play.html',
        'js/lib/template!templates/game-splash.html'
    ],
    function ( Backbone, endTemplate, playTemplate, splashTemplate ) {

        return Backbone.View.extend({

            events : {
                'click #game-splash .btn-play' : '_handleSplashPlay',
                'click #game-play .btn-stop' : '_handleStopPlaying',
                'click #game-end .btn-replay' : '_handleReplay',
                'click #game-end .btn-exit' : '_handleExit'
            },

            getGameContainer : function () {

                return this.$('#game-container');
            },

            getAudioPlayerContainer : function () {

                return this.$('#audio-player');
            },

            _handleExit : function () {
                this.trigger('exit');
            },

            _handleReplay : function () {
                this.trigger('replay');
            },

            _handleStopPlaying : function () {
                this.trigger('stop-playing');
            },

            _handleSplashPlay : function () {
                this.trigger('play');
            },

            renderEnd : function () {

                this.$el.html( endTemplate.render({
                    gameModel : this.model.toJSON()
                }) );
            },

            renderPlay : function () {

                this.$el.html( playTemplate.render({
                    gameModel : this.model.toJSON()
                }) );
            },

            renderSplash : function () {

                this.$el.html( splashTemplate.render({
                    gameModel : this.model.toJSON()
                }) );
            }
        });
    }        
);