//
// bindings.js
//
// Contains the Knockout bindings which handle the interactions between
// underlying data models and the UI.
//


;( function( ko) {

	// Magic numbers
	var border_width = 4;

	ko.bindingHandlers.debug = {
		init: function( element, valueAccessor, allBindingsAccessor, context) {
			
		},
		update: function( element, valueAccessor, allBindingsAccessor, context) {
			console.log( element);
			console.log( valueAccessor());
		}
	};

	// Based on: http://knockoutjs.com/examples/animatedTransitions.html
	ko.bindingHandlers.fadeVisible = {
		init: function(element, valueAccessor) {
			var value = valueAccessor();
			$(element).toggle(ko.unwrap(value)); 
		},
		update: function(element, valueAccessor) {
			var value = valueAccessor();
			ko.unwrap(value) ? $(element).fadeIn() : $(element).hide();
		}
	};

	ko.bindingHandlers.playlist_drag_ui = {
		// Handles the dragging and snapping of playlists.
		init: function( element, valueAccessor, allBindingsAccessor, context) {
			var value = valueAccessor();

			$(element)
				.data( "valueAccessor", valueAccessor )
				.draggable( {
					containment: "#workspace",
					handle: "div.title_bar",
					snap: "div.b_playlist_container",
					snapMode: "outer",
					zIndex: 100,
					stop: function( e, ui) {
						var $this = $(this);
						var playlist = ko.unwrap( valueAccessor());
						var snapped = $this.data( 'ui-draggable').snapElements;
						
						var snapped_to = $.map( snapped, function( elt) { 
							return elt.snapping ? elt.item : null;
						});
						
						if( snapped_to.length) { // Snapped
							var sn_playlist = $(snapped_to).data("valueAccessor")();
							var top = ui.position.top, left = ui.position.left;
							var sn_top = sn_playlist.top(), sn_left = sn_playlist.left();
							
							playlist.left( left);

							if( top < (sn_top + 10) && !playlist.next()) { 
								// Snapping underneath
								playlist.top( sn_top - $this.height() - border_width);
								playlist.next( sn_playlist);
								sn_playlist.prev( playlist);
							}
							else if( !playlist.prev()) { 
								// Snapping above the dragged playlist
								playlist.top( sn_top + $(snapped_to).height() + border_width);
								playlist.prev( sn_playlist);
								sn_playlist.next( playlist);
							}
						}
						else {
							playlist.left( ui.position.left);
							playlist.top( ui.position.top);

							if( playlist.prev()) {
								playlist.prev().next( null);
								playlist.prev( null);
							}
							if( playlist.next()) {
								playlist.next().prev( null);
								playlist.next( null);
							}

						}
					}
				})
			;

		},
		update: function( element, valueAccessor, allBindingsAccessor, context) {
		}
	};

	ko.bindingHandlers.ensure_height = {
		init: function( element, valueAccessor, allBindingsAccessor, context) {
			
		},
		update: function( element, valueAccessor, allBindingsAccessor, context) {
			var value = valueAccessor();
			var parent = value.parent;
			var next = parent.next(), prev = parent.prev();

			if( next) {
				next.top( parent.top() + $(element).height() + border_width);
			}
		}
	};


	ko.bindingHandlers.video_player = {
		// Creates the video player and tracks the currently selected video.
		init: function( element, valueAccessor, allBindingsAccessor, context) {
			var $player_div = $("<div>").appendTo( element);
			
			window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
				player = new YT.Player($player_div[0], {
					height: '390',
					width: '640',
					videoId: '',
					events: {
						// 'onReady': player_ready,
						'onStateChange' : player_state_changed,
						'onError' : player_error
					}
				});

				$(element).data( "player", player);
			}

			function player_error( event) {
				console.log( event.data);
			}

			function player_state_changed( event) {
				if( event.data == YT.PlayerState.ENDED) {// ended
					Cherry.ui.song.select_next();
				}
			}

		},
		update: function( element, valueAccessor, allBindingsAccessor, context) {
			var value = ko.unwrap( valueAccessor()),
			player = $(element).data( "player");
			
			if( value && value.path()) {
				player.loadVideoById( {
					videoId: value.path()
				});
			}
			else if( player) {
				player.stopVideo();
				player.clearVideo();
			}
		}
	};


}( ko));
