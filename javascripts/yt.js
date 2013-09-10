//
// yt.js
//
// Contains the code to interface with Youtube's data API.
//


;

function gapi_onload( ) {
	var gapi_key = "AIzaSyBOh7Pxz4BZzVCQLPXxC4TBQVte02P_Pfw";		
	gapi.client.setApiKey( gapi_key);
	gapi.client.load( 'youtube', 'v3');
}

(function( $) {
	
	// Get the Youtube iframe API
	$( "script:first").after('<script src="http://www.youtube.com/iframe_api"></script>');

	window.Cherry = window.Cherry || {};
	
	Cherry.youtube = Cherry.youtube || {
		get_id_from_url: function( url) {
			// via: stackoverflow.com/questions/3452546
			//      /javascript-regex-how-to-get-youtube-video-id-from-url
			var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
			var match = url.match(regExp);
			if( match && match[2].length == 11) {
				return match[2];
			}
			else {
				throw( "YoutubeDecodeURLError");
			}
		},
		
		get_name_from_id: function( id, callback) {
			var name = null;
			var request = gapi.client.youtube.videos.list( {
				part: "snippet",
				id: id
			});
			
			request.execute( function( response) {
				if( !response.items[0]) return;
				name = response.items[0].snippet.title;

				callback( name);
			});
		}

	};

}(jQuery));
