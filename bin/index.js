#!/usr/bin/env node

var kitiot  = require('../lib/kit-iot'),
    pkg     = require('../package.json'),
    token   = require('../lib/token'),
    argv    = require('minimist')(process.argv.slice(2)),
    args    = process.argv,
    isConsole = false;

//Check if we want to execute only a task ...
var isTask = argv["show-credentials"];
//Check if show log
var showLog = argv["show-log"];

//Check if we want to use the console mode ...
isConsole = argv.setup || argv.console || showLog;

//If show credentiasl
if (isTask) {
  var config = t.getConfig();

  for (var key in config) {
    console.log(key + " = " + config[key]);
  }

  return;
}

//Check for console setup ...
if (argv.setup) {
  if (!argv.username || !argv.password || !argv.apikey || !argv.service) {
    console.log("Erro! os seguintes parametros sao necessarios:");
    console.log("  --username");
    console.log("  --password");
    console.log("  --apikey");
    console.log("  --service");
    console.log("Exemplo:");
    console.log('kit-iot-4g --setup --username="your-user-name" --password="your-pass" --apikey="your-api-key" --service="your-service-name"');

  } else {
    t.saveConfig({
      "username": argv.username,
      "password": argv.password,
      "apikey"  : argv.apikey,
      "service" : argv.service
    });
  }

  return;
}


//Create a new Kit instance
var KitIoT = new kitiot({
  isConsole: isConsole,
  showLog: showLog,
  loopTime: 5000
});


//If is not console start the io connection
if (!KitIoT.isConsole) {
  //On io connection start the arduino
  KitIoT.io.on('connection', function (socket) {
    KitIoT.connect();

    KitIoT.start();

    //Start sending/saving data
    socket.on('start', function () {
      if (!KitIoT.token.getService()) {
        KitIoT.logout();

      } else {
        KitIoT.start();
      }
    });

    //Stop sending/saving data
    socket.on('stop', function () {
      KitIoT.clearLoop(KitIoT.loop);
    });
  });
}
