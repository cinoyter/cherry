/* Author:

*/

;(function( $)
{
	function initialize_environment( )
	{
			
		$("#library, #player_frame").draggable( {
			handle: "div.title_bar",
			iframeFix: true
		});

		window.Cherry = window.Cherry || {};
	
		Cherry.prototypes = {
			Song: function( data_in ) {
				data_in = data_in || {};
				
				var x = {
					"id" : Cherry.ui.next_id( "song"),
					"name" : ko.observable( data_in.name || null),
					"path" : ko.observable( data_in.path || null)
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
				}, x);

				x.id = Cherry.ui.next_id( "playlist");
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
				add_song: function Cherry__ui__library__add( url) {
					if( typeof( url) !== typeof "") {
						url = prompt( "Please enter the Youtube URL");
						if( !url) return;
					}
					var id = Cherry.youtube.get_id_from_url( url);

					var s = Cherry.prototypes.Song( { name: id, path: id});
					Cherry.library.push( s);

					Cherry.youtube.get_name_from_id( id, function( name) {
						s.name( name);
					});
				}
			},
			mouse : {
				last_drop_top: ko.observable(),
				last_drop_left: ko.observable()
			},

			playlist: {
				add: function Cherry__ui__playlist__add( opts) {
					var pl = Cherry.prototypes.Playlist( opts);
					Cherry.playlists.push( pl);
					
				},
				after_sort: function( arg, e, ui) {
					$("#workspace_target_underlay").hide();
				},
				before_sort: function( arg, e, ui) {
					e.stopPropagation();
					$("#workspace_target_underlay").show();

					// Save location of last drop for the subscription
					// which will build the new playlist on the workspace
					var workspace_offset = $("#workspace").offset();
					var relLeft = e.pageX - workspace_offset.left;
					var relTop = e.pageY - workspace_offset.top;

					// Hack to get past jQuery bug 7777:
					// http://bugs.jqueryui.com/ticket/7777
					// If we are dropping onto the overlay to make a new playlist,
					// make sure we aren't also on top of some other widget
					var elt_at_point = document.elementFromPoint( e.clientX, e.clientY);
					if( $(elt_at_point).is( "ul.b_playlist") &&
						e.target.id == "workspace_target_underlay") {
						arg.cancelDrop = true;
						$("#workspace_target_underlay").hide();
					}
					else {
						Cherry.ui.mouse.last_drop_top( relTop);
						Cherry.ui.mouse.last_drop_left( relLeft);
					}
				},
				remove: function( pl) {
					if( pl.prev() && pl.next()) {
						pl.prev().next( pl.next());
					}
					else {
						if( pl.prev()) pl.prev().next( null);
						if( pl.next()) pl.next().prev( null);
					}
					Cherry.playlists.remove( pl);
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
			},
			
			next_id : function Cherry__support__next_id( id_type)
			{
				if( !id_type) {				
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
			}
		};

		Cherry.state = {
			selected: {
				playlist: ko.observable( null),
				playlist_idx: ko.observable( null), 
				song: ko.observable( null)
			}
		};

		Cherry.sample_data = function Cherry__support__sample_data(){
			var videos = [
				"http://www.youtube.com/v/sdyC1BrQd6g",
				"http://www.youtube.com/v/aEm8UXNaXxk",
				"http://www.youtube.com/v/X37EzJnuntk",
				"http://www.youtube.com/v/b0Ti-gkJiXc",
				"http://www.youtube.com/v/eSMeUPFjQHc",
				"http://www.youtube.com/v/TxVQAj3SdF0",
				"http://www.youtube.com/v/IY2j_GPIqRA"];
			for( var v in videos)
			{
				var fillString = videos[v];
				
				Cherry.ui.library.add_song( fillString);
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
		};
	
		// Catch new songs being dragged to workspace with this fake playlist.
		// We watch it for changes and when they happen, we pop them and make a new
		// playlist at the last mouse-drop coordinates.
		Cherry.ui.playlist.pending_new_playlist = ko.observableArray([]);
		Cherry.ui.playlist.pending_new_playlist.subscribe( function( val) {
			if( val[0]) {
				var songs = [val[0]];
				
				Cherry.ui.playlist.add( 
					{ 
						songs: songs,
						left: Cherry.ui.mouse.last_drop_left(),
						top: Cherry.ui.mouse.last_drop_top()
					} ); 			
				Cherry.ui.playlist.pending_new_playlist.pop();
			}
		});

		ko.applyBindings( Cherry);
	
	}

	$(document).ready( function() {
		initialize_environment();
	});
	
}( jQuery));
