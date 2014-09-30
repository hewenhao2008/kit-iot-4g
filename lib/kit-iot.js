var kit      = require('./kit'),
    cloudApi = require('./cloud-api.js'),
    temporal = require('temporal'),
    log      = require('single-line-log').stdout,
    config   = new kit.Config();

//Kit IoT
var KitIoT = function (options) {
  this.config = config;
};

//Set console to true
KitIoT.prototype.showConsole = function () {
  this.console = true;
}

//Connect
KitIoT.prototype.connect = function () {
  var _this = this;

  if (!this.arduino) {
    this.arduino     = new kit.Arduino();
    this.temperature = new kit.Sensor({ arduino: this.arduino, pin: 'A0' });
    this.light       = new kit.Sensor({ arduino: this.arduino, pin: 'A1' });

    //Luminosity
    this.light.on('read', function (m) {
      _this.light.value = m;
    });

    //Temperature
    this.temperature.on('read', function (m) {
      _this.temperature.value = m;
    });

    //On uncaught exception kill process
    process.on('uncaughtException', function (err) {
      _this.clearTemporal();
      console.log(err);
      process.exit(1);
    });

    //On arduino connection error
    this.arduino.on('error', function (err) {
      _this.clearTemporal();
      console.log(err);
      process.exit(1);
    });

    //Wait one second to start
    temporal.delay(1000, function () {
      _this.start();
    });
  }
};

//Start loop to send and save data
KitIoT.prototype.start = function () {
  var _this = this;

  var doUpdateDashboard = function () {
    var data = _this.getSensorValues();

    if (data) {
      log(
        '> umidade    : '+ data[0].value + '\n' +
        '> temperatura: '+ data[1].value + '\n'
      );
    }
  };

  var doSave = function () {
    _this.saveData();
  };

  _this.loop = temporal.queue([{
      delay: 0,
      task: function() {
        doSave();
      }
    }, {
      loop: 900000,
      task: function() {
        doSave();
      }
    }
  ]);

  if (this.console) {
    _this.loopDash = temporal.loop(5000, function () {
      doUpdateDashboard();
    });
  }
};


//Save data to Natura API
KitIoT.prototype.saveData = function () {
  var _this   = this,
      apiKey  = config.getApikey(),
      data    = _this.getSensorValues();

  //If no apikey in config
  if (!apiKey) {
    cloudApi.auth({
      config: config,
      callback: function () {
        _this.restart();
      }
    });

  //If have api key send data to the cloud
  } else {
    cloudApi.feed({
      data: data,
      apiKey: apiKey
    });
  }
};


//Get sensor values
KitIoT.prototype.getSensorValues = function () {
  if (this.light.value && this.temperature.value) {
    return [{
      alias: 'Umidade',
      type: 'relative humidity',
      value: (this.light.value / 10).toFixed(0)

    }, {
      alias: 'Temeratura',
      type: 'temperature',
      value: (((5 * this.temperature.value) * 100) / 1024).toFixed(0)
    }];
  }

  return false;
};


//Clear loops
KitIoT.prototype.clearTemporal = function () {
  if (this.loop) {
    this.loop.stop();
  }

  if (this.console) {
    this.loopDash.stop();
  }
};

//Restar the app
KitIoT.prototype.restart = function () {
  this.clearTemporal();
  this.start();
};


module.exports = KitIoT;

