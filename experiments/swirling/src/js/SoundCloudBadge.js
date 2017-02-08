// SoundCloudBadge.js
import resolve from 'soundcloud-resolve';

function badge(options, callback) {
	const id    = options.client_id;
	const song  = options.song;

	resolve(id, song, function(err, json) {
	  	if (err) return callback(err)
	  	if (json.kind !== 'track') throw new Error(
	    	'soundcloud-badge only supports individual tracks at the moment'
	  	)

	  	callback(null, json.stream_url + '?client_id=' + id, json);
	})
}


export default badge;