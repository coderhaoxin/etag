
/**
 * Module dependencies.
 */

var crc = require('buffer-crc32').signed;
var Stream = require('stream');

/**
 * Expose `etag`.
 */

module.exports = etag;

/**
 * Add ETag header field.
 *
 * @return {Function}
 * @api public
 */

function etag() {
  return function(next){
    return function *(){
      yield next;

      // no body
      var body = this.body;
      if (!body) return;

      // type
      var status = this.status / 100 | 0;
      var type = typeof body;
      var etag;

      // 2xx
      if (2 != status) return;

      // stream
      // TODO: fall back on inode / mtime etc for streams
      if (body instanceof Stream) return;

      // string
      if ('string' == type) etag = crc(body);

      // buffer
      if (Buffer.isBuffer(body)) etag = crc(body);

      // json
      etag = crc(JSON.stringify(body));

      // add etag
      if (etag) this.set('ETag', '"' + etag + '"');
    }
  }
}