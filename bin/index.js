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
isConsole = argv.setup || argv.console;

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
  isConsole = true;

  if (!argv.name || !argv.username || !argv.password || !argv.email || !argv.tel || !argv.apikey || !argv.token) {
    console.log("Erro! os seguintes parametros sao necessarios:");
    console.log("  --name");
    console.log("  --password");
    console.log("  --email");
    console.log("  --tel");
    console.log("  --apikey");
    console.log("  --token");
    console.log("Exemplo:");
    console.log("kit-iot-4g --setup --name=Seu Nome --username=cprecifeA_b --password=0123 --email=a@a.com --tel=123 --apikey=a012b024 --token=0123");

  } else {
    t.saveConfig({
      "name":     argv.name,
      "usuario":  argv.username,
      "password": argv.password,
      "email":    argv.email,
      "tel":      argv.tel,
      "apikey":   argv.apikey,
      "token":    argv.token
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
      if (!KitIoT.token.getToken()) {
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
