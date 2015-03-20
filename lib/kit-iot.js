var kit     = require('./kit'),
    request = require('request'),
    log     = require('single-line-log').stdout,
    token   = new kit.Token();

//Kit IoT
var KitIoT = function (options) {
  this.token = token;
  this.isPrintable = false;
  this.loopTime = options.loopTime || 5000;
  this.showLog = options.showLog || false;
  this.isWeb = options.isWeb || false;

  //If is console start connect to the arduino and start the script
  if (!this.isWeb) {
    this.connect();
    this.start();

  } else {
    var io = require('socket.io');

    this.server = new kit.Server({ port: '4000' });
    this.io = io.listen(this.server.http, { log: false });
  }
};

//Connect
KitIoT.prototype.connect = function () {
  var _this = this;

  if (!this.arduino) {
    this.arduino     = new kit.Arduino();
    this.button      = new kit.Button({ arduino: this.arduino, pin: 5 });
    this.temperature = new kit.Sensor({ arduino: this.arduino, pin: 'A0' });
    this.light       = new kit.Sensor({ arduino: this.arduino, pin: 'A1' });
    this.capacitive  = new kit.Capacitive({ arduino: this.arduino, pin: 2 });

    this.button.value = 0;

    //Button
    this.button.on('down', function () {
      _this.button.value = 1;

      if (_this.isWeb) {
        _this.io.sockets.emit('button', _this.button.value);
      }

    }).on('up', function () {
      _this.button.value = 0;

      if (_this.isWeb) {
        _this.io.sockets.emit('button', _this.button.value);
      }
    });

    //Luminosity
    this.light.on('read', function (m) {
      _this.light.value = m;
    });

    //Temperature
    this.temperature.on('read', function (m) {
      _this.temperature.value = m;
    });

    //Capacitive
    this.capacitive.on('read', function (m) {
      _this.capacitive.value = m;
    });

    //Capacitive
    this.capacitive.on('read', function (m) {
      _this.capacitive.value = m;
    });

    //On arduino error
    this.arduino.on('error', function (e) {
      _this.isPrintable = false;
      log('Trying reconnection');
    });

    //On arduino error
    this.arduino.on('ready', function (e) {
      _this.isPrintable = true;
    });

    // On uncaught exception kill process
    process.on('uncaughtException', function (err) {
      log(err);
    });
  }
};

//Start loop to send and save data
KitIoT.prototype.start = function () {
  var _this = this;

  var doUpdateDashboard = function () {
    var data = _this.getSensorValues();

    if (_this.showLog && _this.isPrintable) {
      log(
        '*----------------------*\n' +
        '*      Dashboard       *\n' +
        '*----------------------*\n' +
        '   botão: ' + data.button + '\n' +
        '   luz: '+ data.light + '\n' +
        '   temperatura: '+ data.temperature + '\n' +
        '   capacitivo: '+ data.capacitive + '\n' +
        '*----------------------*\n'
      );
    }

    if (_this.isWeb) {
      _this.io.sockets.emit('data', data);
    }
  };

  var doSaveData = function () {
    var data = _this.getSensorValues();
    _this.saveData(data);
  };

  doUpdateDashboard();
  doSaveData();

  _this.loop = setInterval(doSaveData, _this.loopTime);
  _this.loopDash = setInterval(doUpdateDashboard, _this.loopTime);
};

//Save data to SBC
KitIoT.prototype.saveData = function (data) {
  var _this    = this,
      URL     = 'http://dca.telefonicabeta.com:8002',
      rawBody = '|||unknown||chave|'+ data.button +'#|||temperature||temperatura|'+ data.temperature +'#|||illuminance||luminosidade|'+ data.light +'#|||presence||capacitivo|'+ data.capacitive,
      serviceId = token.getService(),
      apiKey  = token.getApikey();

  if (!apiKey) {
    if (_this.isWeb) {
      _this.io.sockets.emit('no-internetConnection', { msg: 'Service não encontrado' });
    }

  } else {
    request({
      method: 'POST',
      url   : URL + '/idas/2.0?apikey='+ apiKey +'&ID=kit-iot-4g',
      body  : rawBody

    }, function (err, res, body) {
      if (_this.isWeb) {
        if (!err) {
          if (res.statusCode === 200) {
            _this.io.sockets.emit('internetConnection', { msg: 'Conectado na nuvem' });

          } else {
            _this.io.sockets.emit('no-internetConnection', { msg: 'Erro ao salvar os dados do Kit' });
          }

        } else {
          if (err.code === 'EHOSTUNREACH') {
            _this.io.sockets.emit('no-internetConnection', { msg: 'Sem conexão com a internet' });
          }
        }
      }
    });
  }
};

//Clear loop
KitIoT.prototype.clearLoop = function (l) {
  clearInterval(l);
};

//Disconnect
KitIoT.prototype.disconnect = function () {
  this.clearLoop(this.loop);
  this.clearLoop(this.loopDash);

  if (this.isWeb) {
    this.io.sockets.emit('disconnect');
  }
};

//Logout
KitIoT.prototype.logout = function () {
  this.clearLoop(this.loop);
  this.clearLoop(this.loopDash);

  if (this.isWeb) {
    this.io.sockets.emit('logout');
  }
};

//Get sensor values
KitIoT.prototype.getSensorValues = function () {
  return {
    button     : (this.button.value || 0),
    light      : (this.light.value || 0),
    temperature: (( 5.0 * parseFloat(this.temperature.value || 0) * 100.0) / 1024.0).toFixed(0), // to celsius
    capacitive : (this.capacitive.value || 0)
  };
};

module.exports = KitIoT;
