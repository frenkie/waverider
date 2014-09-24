define(
    [
        'soundcloud',
        'swfobject',
        'backbone',
        'jquery'
    ],

    function ( soundcloud, swfobject, Backbone, $ ) {

        var SoundCloudGameModel = Backbone.Model.extend({

            _bindAudioListeners : function () {
                soundcloud.addEventListener( 'onPlayerReady', this._handleMediaReadyProxy );
                soundcloud.addEventListener( 'onMediaEnd', this._handleMediaEndProxy );
                soundcloud.addEventListener( 'onMediaStart', this._handleMediaStartProxy );

                this.timer = setInterval( this._handleTimeUpdateProxy, 10 );
            },

            _createAudio : function () {

                var playerId = this.get('audioContainer');
                var flashvars = {
                    enable_api: true,
                    object_id: playerId,
                    url: this.get('data').permalink_url
                };
                var params = {
                    allowscriptaccess: 'always'
                };
                var attributes = {
                    id: playerId,
                    name: playerId
                };

                this._bindAudioListeners();

                swfobject.embedSWF(
                    'http://player.soundcloud.com/player.swf',
                    playerId, '81', '40', '9.0.0','expressInstall.swf',
                    flashvars,
                    params,
                    attributes);
            },

            defaults : {
                'ready' : false,
                'data' : {},
                'time' : 0
            },

            _getCurrentTime : function () {
                if ( this.get('ready') ) {
                    try {
                        return this.get('player').api_getTrackPosition();
                    } catch ( e ) {
                        return 0;
                    }
                } else {
                    return 0;
                }
            },

            getWaveFormUrl : function () {
                return this.get('data').waveform_url;
            },

            _handleMediaEnd : function () {
                this.trigger('end');
            },

            _handleMediaReady : function () {
                this.set( 'player', soundcloud.getPlayer( this.get('audioContainer') ) );
                this.get('player').api_play();
            },

            _handleMediaStart : function () {
                this.set( 'ready', true );
            },

            _handleTimeUpdate : function () {
                this.set( 'time', this._getCurrentTime() );
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
                    this.get('player').api_play();
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

                    this.get('player').api_stop();

                    this.set( 'time', 0, {silent: true} );
                    this.unset('player');
                }
            },

            _unbindAudioListeners : function () {
                soundcloud.removeEventListener( 'onPlayerReady', this._handleMediaReadyProxy );
                soundcloud.removeEventListener( 'onMediaEnd', this._handleMediaEndProxy );
                soundcloud.removeEventListener( 'onMediaEnd', this._handleMediaEndProxy );

                if ( this.timer ) {
                    clearInterval( this.timer );
                }
            }
        });

        return SoundCloudGameModel;
    }
);