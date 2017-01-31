var request = require('supertest');
var prepareApp = require('../src/app.js');
var expect = require('expect.js');
var CachedCss = require('../src/models/CachedCss.js');
var redis = require('redis-mock');

describe('index.js', function () {
  describe('POST /css', function () {
    before(function () {
      this.client = redis.createClient();
      this.app = prepareApp({ redis: this.client });
    });

    describe('with valid params', function () {
      var params = { key: 1, url: '/path', css: '/css' };

      describe('asking for item that is ready', function () {
        before(function (done) {
          this.cached = new CachedCss(this.client, params);
          this.cached.finish('css {};', done);
        });

        it('should return a 200 and the content', function () {
          return request(this.app).post('/css')
            .send(params)
            .set('Content-Type', 'application/json')
            .expect(200, 'css {};');
        });
      });

      describe('asking for item that is not ready', function () {
        var params = { key: 2, url: '/path', css: '/css' };

        it('should return a 202', function () {
          return request(this.app).post('/css')
            .send(params)
            .set('Content-Type', 'application/json')
            .expect(202);
        });
      });
    });
  });
});
