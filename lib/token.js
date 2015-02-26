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
      "name":     null,
      "usuario":  null,
      "password": null,
      "email":    null,
      "tel":      null,
      "token":    null,
      "apikey":   null
    };
  }

  return file;
};

Token.prototype.getToken = function () {
  return this.getConfig().token;
};

Token.prototype.getApikey = function () {
  return this.getConfig().apikey;
};


//Save token
Token.prototype.saveConfig = function (jsonConfig) {
  if (this.getToken()) {
    fs.unlinkSync(this.file);
  }

  fs.writeFileSync(this.file, JSON.stringify(jsonConfig, null, 4));
};

module.exports = Token;
