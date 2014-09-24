define(
    [
        'backbone',
        'js/lib/template!templates/preload.html'
    ],
    function ( Backbone, template ) {

        return Backbone.View.extend({

            render : function ( gameModel ) {

                this.$el.html( template.render({
                    gameModel : gameModel
                }) );
            }
        });
    }        
);