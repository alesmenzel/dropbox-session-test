# dropbox-session-test

Sample for testing Dropbox Session API from a readable stream.

## How it works
Reads a readable stream (aka your file) into a transform stream that buffers up data up to given amount (`chunkSize: 8000 * 1024 /* ~8MB */}`) and then passes the data to dropbox upload stream that opens a dropbox session and appends the data.

## Prerequisites
 - Include a **file to be read into a stream** (see index.js - `./samples/sample-10MB.mp4`) - Can be any file, any size
 - Please set **DROPBOX_TOKEN** in the `/src/dropbox.js` - get your token for your app [here](https://www.dropbox.com/developers/apps/create)
 - Please set your **DEBUG** env to stream-to-dropbox:* to see whats happening.
