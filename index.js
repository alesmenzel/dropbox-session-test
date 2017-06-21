const debug = require('debug')('stream-to-dropbox:upload');
const fs = require('fs');

const TransformStream = require('./src/transform');
const DropboxUploadStream = require('./src/dropbox');

// Prepare all the streams
let file = fs.createReadStream('./samples/sample-10MB.mp4');
const transformStream = new TransformStream({chunkSize: 8000 * 1024 /* ~8MB */});
const dropboxUpload = new DropboxUploadStream();

debug('Start');
// Pipe it
file.pipe(transformStream).pipe(dropboxUpload)
.on('error', (err) => {
	console.log('ERR: ', err);
})
.on('finish', () => {
	debug('Done');
});
