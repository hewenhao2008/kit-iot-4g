var request = require('request'),
    _       = require('underscore');

var defaultUrl = 'http://natura.telefonicabeta.com';

//Api connection
var cloudApi = function (options, callback) {
  var defaults = {
    url   : defaultUrl + '/api/v1/feeds',
    json  : {},
    method: 'POST'
  };

  _.extend(defaults, options);

  request(defaults, function (err, res, body) {
    if (!err) {
      callback(null, res, body);

    } else {
      callback(err, res, body);
    }
  });
};

var auth = function (options) {
  var randomMac = require('random-mac');

  cloudApi({
    url: defaultUrl + '/api/v1/device/auth',
    json: {
      alias       : options.config.getData().alias,
      hardware    : randomMac(),
      'public-key': options.config.getPublicKey()
    }

  }, function (err, res, body) {
    if (err) {
      console.log(err);
      return;
    }

    if (body['api-key']) {
      var conf = options.config.getData();
      conf['api-key'] = body['api-key'];

      options.config.saveData(conf);
      options.callback();
    }
  });
};


var feed = function (options) {
  if (options.data) {
    cloudApi({
      headers: {
        'Api-Key': options.apiKey
      },
      json: {
        timestamp: _.now(),
        data: options.data
      }

    }, function (err, res, body) {
      if (err) {
        console.log(err);
        return;
      }
    });
  }
};


module.exports = {
  cloudApi: cloudApi,
  auth    : auth,
  feed    : feed
};

