define(function () {

    return {

        hasCanvasSupport: !! window.CanvasRenderingContext2D,
        hasWebglSupport: ( function () {
            try {
                var canvas = document.createElement( 'canvas' );
                return !! ( window.WebGLRenderingContext &&
                        ( canvas.getContext( 'webgl' ) ||
                          canvas.getContext( 'experimental-webgl' ) ) );
            } catch( e ) {
                return false;
            }
        } )(),

        isSupported : function () {
            return this.hasWebglSupport;
        }
    };
});