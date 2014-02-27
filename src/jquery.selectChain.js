// Object.create is not supported in legacy browsers (IE8 and below)
if (typeof Object.create !== 'function' ) {

	Object.create = function( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};

}

// Object.keys is not supported in legacy browsers (IE8 and below)
if (typeof Object.keys !== 'function') {

    Object.keys = function (obj) {
        var keys = [],
            k;
        for (k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        return keys;
    };

}

;(function( $, window, document, undefined ) {

	var Chain = {
		init: function( options, elem, selector ) {
			var self = this;

			self.elem = elem;
			self.$elem = $( elem );

			self.selector = selector;

			// overwrite default options
			self.options = $.extend( {}, $.fn.selectChain.options, options );

			self.setup( self.options );

		},

		setup: function( options ) {
			var self = this;

			// iterate around the supplied steps and setup on change listeners
			for (i=0;i<Object.keys(options.steps).length;i++) {

				// setup the on change event listener for the select
				if ($(self.selector + ' ' + options.steps[i].selector).length > 0) {

					self.change( self.selector + ' ' + options.steps[i].selector, i );

				}

			}

			// disable all child select on setup
			self.disableChilden( 0 );

			// complete the first step in the select chain
			self.step( 0 );

		},

		step: function( n ) {
			var self = this;

			var currentStep = self.options.steps[n];
			var nextStep = self.options.steps[n + 1];

			// get the id of the current element, if assigned
			var parentId = self.$elem.find(currentStep.selector).children('select').val();

			if (typeof parentId != 'undefined' && parentId > 0) {

				// fetch data for the next select in the chain
				self.fetch( nextStep, parentId ).done(function( result ) {

					self.update( nextStep, result );

				});

			}

		},

		fetch: function( options, id ) {

			// get the required data
			return $.ajax({
				url: options.url + '/' + id,
				type: 'GET',
				dataType: 'html',
				cache: false,
			});

		},

		disable: function( $selector, loading ) {
			var self = this;

			$selector.attr('disabled', 'disabled');
			$selector.trigger('update');

			if (typeof loading != 'undefined' && loading === true) {

				// show loading text and disable select
				$selector.next('span').children('.styled-selectInner').text( self.options.loadingText );

			}

		},

		update: function( options, elem ) {
			var self = this;

			var $container = self.$elem.find( options.selector );

			// apply the result to the country select
			$container.children('span').remove();
			$container.children('select').replaceWith(elem);

			// re-apply custom select
			$container.children('select').customSelect({
				customClass: "styled-select"
			});

		},

		change: function( selector, i ) {
			var self = this;

			$(document).on('change', selector, function() {

				self.disableChilden( i, true );
				self.step( i );

			});

		},

		disableChilden: function( c, showLoading ) {
			var self = this;

			var loading = (typeof showLoading != 'undefined' && showLoading == true);

			// c refers to the current step so forcefully iterate
			n = c + 1;

			// disable further items in the chain
			for (i=n;i<Object.keys(self.options.steps).length;i++) {

				var selector = self.options.steps[i].selector;

				// disable the select
				self.disable( self.$elem.find( selector ).children('select'), loading );

				var loading = false;

			}

		}

	};

	$.fn.selectChain = function( options ) {

		var selector = this.selector;

		return this.each(function() {

			var chain = Object.create( Chain );
			chain.init( options, this, selector );

		});

	};

	$.fn.selectChain.options = {
		'steps': null,
		'loadingText': 'Loading...'
	};

})( jQuery, window, document );