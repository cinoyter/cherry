/* Author:

*/

(function( $)
{


	function initialize_environment( )
	{

		ko.bindingHandlers.debug = {
			init: function( element, valueAccessor, allBindingsAccessor, context) {
				
			},
			update: function( element, valueAccessor, allBindingsAccessor, context) {
				console.log( element);
				console.log( valueAccessor());
			}
		};

		ko.bindingHandlers.playlist_drag_ui = {
			init: function( element, valueAccessor, allBindingsAccessor, context) {
				var value = valueAccessor();
				

				$(element)
					.data( "valueAccessor", valueAccessor )
					.draggable({
						containment: "#workspace",
						handle: "div.b_playlist_container_handle",
						snap: "div.b_playlist_container",
						snapMode: "outer",
						zIndex: 100,
						stop: function( e, ui) {
							var $this = $(this);
							var playlist = ko.unwrap( valueAccessor());
							var snapped = $this.data( 'draggable').snapElements;
							
							var snapped_to = $.map( snapped, function( elt) { 
								return elt.snapping ? elt.item : null;
							});
							
							if( snapped_to.length) { // Snapped
								var sn_playlist = $(snapped_to).data("valueAccessor")();
								var top = ui.position.top, left = ui.position.left;
								var sn_top = sn_playlist.top(), sn_left = sn_playlist.left();
								
								playlist.left( left);
								if( top < sn_top) { // Snapping underneath the dragged playlist
									playlist.top( sn_top - $this.height());
									playlist.next( sn_playlist);
									sn_playlist.prev( playlist);
								}
								else { // Snapping above the dragged playlist
									playlist.top( sn_top + $(snapped_to).height());
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
					});

			},
			update: function( element, valueAccessor, allBindingsAccessor, context) {
				
			}
		};

		window.Cherry = window.Cherry || {};
	
		Cherry.prototypes = {
			
			Song: function( data_in ) {
				data_in = data_in || {};
				
				var x = {
					"id" : Cherry.support.next_id( "song"),
					"name" : data_in.name || null,
					"path" : data_in.path || null
				};

				x.selected = ko.computed( function() {
					return this == Cherry.state.selected.song();
				}, x);
				
				return x;
			},
			
			Playlist : function( data_in) {
				var x = {
					"left": ko.observable(100),
					"top": ko.observable(100),
					"height": ko.observable(),
					"width": ko.observable(),
					
					"songs": ko.observableArray(),
					
					"next": ko.observable(),
					"prev": ko.observable()
				};				
				
				for( var i in data_in) {
					if( x[i]) {
						x[i]( data_in[i]);
					}
				}

				x.removeSong = function( song) {
					x.songs.remove( song);
				};

				x.selected = ko.computed( function() {
					return this == Cherry.state.selected.playlist();
				}, x)

				x.id = Cherry.support.next_id( "playlist");
				return x;
			}	
		};
				
		Cherry.library = ko.observableArray([]);
		Cherry.playlists = ko.observableArray([]);
		
		Cherry.available_ids = {
			song: 0,
			playlist: 0
		};

		Cherry.ui = {
			library: {
				add_song: function Cherry__ui__library__add( ) {
					var url = prompt( "Please enter the Youtube URL");
					Cherry.library.push( Cherry.prototypes.Song( {
							name: url, path: url
					}));	
				}
			},
			playlist: {
				add: function Cherry__ui__playlist__add( ) {
					Cherry.playlists.push( Cherry.prototypes.Playlist( {}));
				},
				select: function Cherry__ui__playlist__select( obj) {
					Cherry.state.selected.playlist( obj);
				},
				select_index: function Cherry__ui__playlist__select_index( idx) {
					Cherry.state.selected.playlist_idx( idx);
				}
			},
			song: {
				select: function Cherry__ui__song__select( obj) {
					Cherry.state.selected.song( obj);
				},
				select_next: function Cherry__ui__song__select_next( ) {
					var song = Cherry.state.selected.song,
					pl = Cherry.state.selected.playlist,
					idx = Cherry.state.selected.playlist_idx,
					new_idx = null;

					// If nothing is selected now, kill all the state
					if( !song() || !pl() ) {
						song( null); pl( null); idx( null);
						return;
					}
					
					// Generate the next attempted index, or 0 if the current one is not valid
					new_idx = (typeof idx() == typeof 0) ? idx() + 1 : 0;
					
					if( new_idx < pl().songs().length) {
						idx( new_idx);
						song( pl().songs()[new_idx]);
					}
					else if( pl().next()) {
						// Advance until we have a song or we come to the end of a chain
						do {
							pl( pl().next());
						} while( pl() && !pl().songs().length)

						if( !pl()) { 
							song( null); 
							idx( null);
						}
						else {
							idx( 0);
							song( pl().songs()[0]);
						}
					}
					else {
						// End of a playlist!
						song( null); pl( null); idx( null);
					}
				}
			}
		};

		Cherry.state = {
			selected: {
				playlist: ko.observable( null),
				playlist_idx: ko.observable( null), 
				song: ko.observable( null)
			}
		};

		Cherry.support = {
			
			next_id : function Cherry__support__next_id( id_type)
			{
				if( !id_type)
				{
					throw( "NoIdTypeError");
				}
				
				else if( Cherry.available_ids[id_type] || typeof Cherry.available_ids[id_type] == "number")
				{
					Cherry.available_ids[id_type] ++;
					return( Cherry.available_ids[id_type]);
				}
				
				else
				{
					throw( "InvalidIdTypeRequestedError");
				}
			},
			
			sample_data: function Cherry__support__sample_data(){
				var letters = ["a", "b", "c", "d", "e", "f", "g"];
				for( var letter in letters)
				{
					var fillString = letters[letter] + letters[letter];
					
					var x = Cherry.prototypes.Song( {
							"name" : fillString,
							"path" : fillString
						});
					Cherry.library.push( x);
				}
				
				var sample_playlists = [ [1, 4, 2], [2, 5, 6]];
				for( var i in sample_playlists )
				{
					var this_playlist = sample_playlists[i];
					var this_playlist_ko = Cherry.prototypes.Playlist();
					for( var song_id in this_playlist)
					{
						this_playlist_ko.songs.push( Cherry.library()[ this_playlist[ song_id]]);
					}
					
					Cherry.playlists.push( this_playlist_ko);
				}
				return;
			
			}
		};
	
		ko.applyBindings( Cherry);
	
	}

	$(document).ready( function() {
		initialize_environment();
	});
	
}( jQuery));
