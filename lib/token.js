var fs   = require('fs'),
    path = require('path');

//Toekn manager
var Token = function () {
  this.file = path.resolve(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/kit-iot-4g.json';
};

//Get kit configuration
Token.prototype.getConfig = function () {
  var file;

  try {
    file = require(this.file);

  } catch(e) {
    file = {
      "username": null,
      "password": null,
      "service" : null,
      "apikey"  : null
    };
  }

  return file;
};

Token.prototype.getService = function () {
  return this.getConfig().service;
};

Token.prototype.getApikey = function () {
  return this.getConfig().apikey;
};

//Save token
Token.prototype.saveConfig = function (jsonConfig) {
  if (this.getService()) {
    fs.unlinkSync(this.file);
  }

  fs.writeFileSync(this.file, JSON.stringify(jsonConfig, null, 4));
};

Token.prototype.setup = function (argv) {
  if (!argv.username || !argv.password || !argv.apikey || !argv.service) {
    console.log("Faltam campos obrigatórios:");
    console.log("  --username");
    console.log("  --password");
    console.log("  --apikey");
    console.log("  --service");
    console.log("Exemplo:");
    console.log('kit-iot-4g --setup --username="your-user-name" --password="your-pass" --apikey="your-api-key" --service="your-service-name"');

  } else {
    this.saveConfig({
      "username": argv.username,
      "password": argv.password,
      "apikey": argv.apikey,
      "service": argv.service
    });
  }
};

Token.prototype.showCredentials = function () {
  var config = this.getConfig();

  for (var key in config) {
    console.log(key + " = " + config[key]);
  }
};

module.exports = Token;
