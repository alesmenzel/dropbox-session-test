const debug = require('debug')('stream-to-dropbox:dropbox-upload-stream');
const { Transform } = require('stream');

const Dropbox = require('dropbox');
const dropbox = new Dropbox({ accessToken: 'TOKEN GOES HERE' });

class DropboxUploadStream extends Transform {
	constructor(options) {
		super(options);
		this.sessionId = null;
		this.offset = 0;
	}

	_transform(chunk, encoding, next) {
		debug('Write: ', chunk.byteLength / 1024 + ' KB');

		if (!this.sessionId) {
			return this.sessionStart(chunk, next);
		}

		this.sessionAppend(chunk, next);
	}

	_flush(next) {
		this.sessionFinish(next);
	}

	/**
	 * Starts a dropbox session
	 *
	 * @param chunk
	 * @param next
	 */
	sessionStart(chunk, next) {
		debug('SessionStart: Start');
		dropbox.filesUploadSessionStart({
			close: false,
			contents: chunk
		})
		.then((response) => {
			debug('SessionStart: End');
			this.sessionId = response.session_id;
			debug(`Session id: ${response.session_id}`);
			this.offset += chunk.byteLength;
			return next();
		}, next);
	}

	/**
	 * Appends data to an open dropbox session
	 *
	 * @param chunk
	 * @param next
	 */
	sessionAppend(chunk, next) {
		debug('SessionAppend: Start');
		dropbox.filesUploadSessionAppendV2({
			cursor: {
				session_id: this.sessionId,
				offset: this.offset
			},
			close: false,
			contents: chunk
		})
		.then(() => {
			debug('SessionAppend: End');
			this.offset += chunk.byteLength;
			next();
		}, next);
	}

	/**
	 * Closes the session and commits the file(s)
	 *
	 * @param next
	 */
	sessionFinish(next) {
		debug('SessionFinish: Start', this.offset);
		dropbox.filesUploadSessionFinish({
			"cursor": {
				"session_id": this.sessionId,
				"offset": this.offset
			},
			"commit": {
				"path": "/videos/output-24.mp4",
				"mode": "add",
				"autorename": true,
				"mute": false
			}
		})
		.then(() => {
			debug('SessionFinish: End');
			this.sessionId = null;
			this.offset = 0;
			next();
		}, next);
	}
}

module.exports = DropboxUploadStream;
