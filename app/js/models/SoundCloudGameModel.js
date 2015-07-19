define(
    [
        'soundcloud',
        'swfobject',
        'backbone',
        'jquery'
    ],

    function ( SC, swfobject, Backbone, $ ) {

        var SoundCloudGameModel = Backbone.Model.extend({

            _bindAudioListeners : function () {

                var player = this.get('player');

                player.bind( SC.Widget.Events.READY, this._handleMediaReadyProxy );
                player.bind( SC.Widget.Events.FINISH, this._handleMediaEndProxy );
                player.bind( SC.Widget.Events.PLAY, this._handleMediaStartProxy );
                player.bind( SC.Widget.Events.PLAY_PROGRESS, this._handleTimeUpdateProxy );
            },

            _createAudio : function () {

                var playerId = this.get('audioContainer');

                $( '#'+ playerId ).html(''.concat(
                        '<iframe id="sc-widget" src="https://w.soundcloud.com/player/?url='+
                        this.get('data').permalink_url,
                        '" width=100%" height="100%" scrolling="no" frameborder="no"></iframe>'
                ));

                this.set( 'player', SC.Widget( 'sc-widget' ) );

                this._bindAudioListeners();
            },

            defaults : {
                'ready' : false,
                'data' : {},
                'time' : 0
            },

            getWaveFormUrl : function () {
                return this.get('data').waveform_url;
            },

            _handleMediaEnd : function () {
                this.trigger('end');
            },

            _handleMediaReady : function () {

                this.get('player').play();
            },

            _handleMediaStart : function () {
                this.set( 'ready', true );
            },

            _handleTimeUpdate : function ( playProgress ) {
                this.set( 'time', playProgress.currentPosition / 1000 );
            },

            initialize : function () {
                this._handleMediaEndProxy = this._handleMediaEnd.bind(this);
                this._handleMediaReadyProxy = this._handleMediaReady.bind(this);
                this._handleMediaStartProxy = this._handleMediaStart.bind(this);
                this._handleTimeUpdateProxy = this._handleTimeUpdate.bind(this);
            },

            _interpolateArray : function ( data, fitCount ) {
                var waveHeightMultiply = 450;
                var after, atPoint, before, i, newData, springFactor, tmp;
                newData = [];
                springFactor = Number((data.length - 1) / (fitCount - 1));
                newData[0] = data[0] * waveHeightMultiply;
                i = 1;
                while (i < fitCount - 1) {
                    tmp = i * springFactor;
                    before = Number(Math.floor(tmp)).toFixed();
                    after = Number(Math.ceil(tmp)).toFixed();
                    atPoint = tmp - before;
                    newData[i] = this._linearInterpolate(data[before], data[after], atPoint) * waveHeightMultiply;
                    i++;
                }
                newData[ fitCount - 1 ] = data[ data.length - 1 ] * waveHeightMultiply;
                return newData;
            },

            _linearInterpolate : function( before, after, atPoint ) {
                return before + (after - before) * atPoint;
            },

            play : function () {
                if ( ! this.get('ready') ) {
                    this._createAudio();
                } else {
                    this.get('player').play();
                }
            },

            setAudioContainer : function ( audioContainer ) {
                this.set( 'ready', false );
                this._unbindAudioListeners();

                this.set( 'audioContainer', audioContainer.attr('id') );
            },

            setWaveFormData : function ( waveFormData ) {

                var waveFormForDuration = this._interpolateArray(
                    waveFormData,
                    Math.floor( this.get('data').duration / 1000 )
                );

                this.set( 'waveFormData', waveFormForDuration );
            },

            stop : function () {
                if ( this.get('player') ) {
                    this.set( 'ready', false );
                    this._unbindAudioListeners();

                    this.get('player').pause();

                    this.set( 'time', 0, {silent: true} );
                    this.unset('player');
                }
            },

            _unbindAudioListeners : function () {

                var player = this.get('player');

                if ( player ) {
                    player.unbind( SC.Widget.Events.READY, this._handleMediaReadyProxy );
                    player.unbind( SC.Widget.Events.FINISH, this._handleMediaEndProxy );
                    player.unbind( SC.Widget.Events.PLAY, this._handleMediaEndProxy );
                    player.unbind( SC.Widget.Events.PLAY_PROGRESS, this._handleTimeUpdateProxy );
                }
            }
        });

        return SoundCloudGameModel;
    }
);