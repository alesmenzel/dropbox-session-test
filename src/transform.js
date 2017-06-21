const debug = require('debug')('stream-to-dropbox:transform-stream');
const { Transform } = require('stream');

class TransformStream extends Transform {
	constructor(options) {
		super(options);
		this.chunkSize = options.chunkSize || 1 * 1024 * 1024; // 1 MB
	}

	/**
	 * Buffer the input to reach minimal size of options.chunkSize
	 *
	 * @param {Buffer} chunk Buffer (chunk of data)
	 * @return {boolean}
	 */
	checkBuffer(chunk) {
		if (!this.buffer) {
			this.buffer = Buffer.from(chunk);
		} else {
			this.buffer = Buffer.concat([this.buffer, chunk]);
		}

		return this.buffer.byteLength >= this.chunkSize
	};

	_transform(chunk, encoding, next) {
		// If buffer is too small, wait for more chunks
		if (!this.checkBuffer(chunk)) {
			return next();
		}

		// Chunk is big enough
		debug(`Passing buffer (size: ${Math.round(this.buffer.byteLength / 1024)} KB)`);
		next(null, this.buffer);
		// Clear the buffer
		this.buffer = undefined;
	}

	_flush(next) {
		debug('Flush the last chunk, that might be smaller than options.chunkSize');
		debug(`Passing buffer (size: ${Math.round(this.buffer.byteLength / 1024)} KB)`);
		next(null, this.buffer);
		this.buffer = undefined;
	}
}

module.exports = TransformStream;
