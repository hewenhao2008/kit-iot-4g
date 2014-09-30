var fs   = require('fs'),
    path = require('path'),
    _    = require('underscore');

//Toekn manager
var Config = function () {
  this.file = path.resolve(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.kit-iot-natura.json';
};

//Get kit configuration
Config.prototype.getData = function () {
  if (fs.existsSync(this.file)) {
    var config = fs.readFileSync(this.file, 'utf8');

    return JSON.parse(config);

  } else {
    return {};
  }
};

//Get token or return false
Config.prototype.getPublicKey = function () {
  var config = this.getData();

  if (config.hasOwnProperty('public-key')) {
    return config['public-key'];
  }

  return false;
};


//Get api key pr return false
Config.prototype.getApikey = function () {
  var config = this.getData();

  if (config.hasOwnProperty('api-key')) {
    return config['api-key'];
  }

  return false;
};


//Save token
Config.prototype.saveData = function (jsonConfig) {

  if (!_.isEmpty(this.getData())) {
    fs.unlinkSync(this.file);
  }

  jsonConfig = _.pick(jsonConfig, 'public-key', 'api-key', 'alias');

  fs.writeFileSync(this.file, JSON.stringify(jsonConfig, null, 4));
};


module.exports = Config;

