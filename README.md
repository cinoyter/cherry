Cherry
======

Cherry is an experiment: a spatial playlist editor. [See it in action here.] (http://simberman.com/cherry) 

You might think of this project as a cross between a music player and a window manager. Like all good ideas, this one comes from a problem I had: I used to make mix CDs for friends and family, and I wanted an easy way to see how it sounded to move clumps of songs around within the mix. So in Cherry, the playlist reigns supreme.

* **Create playlists** by dragging songs straight into the workspace from the library or from other playlists.
* **Dock playlists** by dragging playlists right against each other. Cherry will advance into the next playlist automatically.


Setup
-----

Ain't nothin' to it. You can pull this repository and drop it at the location of your choosing, though you'll have to change the Google API key on line 7 of javascripts/yt.js. If you want to play with the styles, I recommend using fire.app  in order to compile the SCSS. [See it in action here.] (http://simberman.com/cherry) 

This is licensed under the [Mozilla Public License 2.0] (http://www.mozilla.org/MPL/2.0/). 

To come
-------

* Full playlist controls on top
* Party Mode, with the YouTube frame full-screen in another window
* Finer-grained playlist control: split, merge, ...
* Multiple workspaces and saving workspaces to server
* ... and more ...

Credits
-------

* [jQuery] (jquery.com) and [jQuery UI] (jqueryui.com)
* [Knockout JS] (http://knockoutjs.com/)
* Google's YouTube [IFRAME] (https://developers.google.com/youtube/iframe_api_reference) and [data] (https://developers.google.com/youtube/v3/) APIs
* [Fire.app] (http://fireapp.handlino.com/)
