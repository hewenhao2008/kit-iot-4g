var Kitiot  = require('./lib/kit-iot'),
    token   = require('./lib/token'),
    argv    = require('minimist')(process.argv.slice(2)),
    args    = process.argv;

//Check if we want to execute only a task ...
var isCredential = argv["show-credentials"],
    isLog = argv["show-log"],
    isWeb = argv.web;

//If show credentiasl
if (isCredential) {
  t.showCredentials();

  return;
}

//Check for console setup ...
if (argv.setup) {
  t.setup(argv);

  return;
}


//Create a new Kit instance
var kit = new Kitiot({
  showLog: isLog,
  loopTime: 5000,
  isWeb: isWeb
});


//If is not console start the io connection
if (kit.isWeb) {
  //On io connection start the arduino
  kit.io.on('connection', function (socket) {
    kit.connect();
    kit.start();

    //Start sending/saving data
    socket.on('start', function () {
      if (!kit.token.getService()) {
        kit.logout();

      } else {
        kit.start();
      }
    });

    //Stop sending/saving data
    socket.on('stop', function () {
      kit.clearLoop(kit.loop);
    });
  });
}
