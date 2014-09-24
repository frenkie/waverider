define(
    [
        'backbone',
        'js/lib/template!templates/intro.html',
        'js/lib/template!templates/intro-searchresults.html'
    ],
    function ( Backbone, introTemplate, resultsTemplate ) {

        return Backbone.View.extend({

            events : {
                'submit .search-form' : '_handleSearchSubmit',
                'click .search-results [data-id]' : '_handleSearchResult'
            },

            clearSearchResults : function () {
                this.$el.find('.search-results').html('');
            },

            _handleSearchSubmit : function ( e ) {
                e.preventDefault();

                this.trigger( 'search', this.$el.find('[name=query]').val() );
            },

            _handleSearchResult : function ( e ) {

                var result = $( e.currentTarget );
                var service = result.parents('[data-service-id]');

                this.trigger( 'search-result', service.data('service-id'), result.data('id') );
            },

            render : function ( services ) {

                this.$el.html( introTemplate.render({
                    capable : true,
                    services : services
                }) );
            },

            renderSearchResults : function ( service, searchResults ) {
                this.$el.find('.search-results').append(
                    resultsTemplate.render({
                        service: service,
                        results: (searchResults) ? searchResults.toJSON() : {}
                    })
                );
            },

            renderUnsupported : function () {
                this.$el.html( introTemplate.render({
                    capable : false
                }) );
            },

            setLoadingState : function ( toggle ) {
                this.$el.find('.search-results-loading')[ toggle ? 'addClass' : 'removeClass' ]( 'loading' );
            }
        });
    }
);