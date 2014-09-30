var KitIoT = require('./lib/kit-iot'),
    Config = require('./lib/config'),
    _      = require('underscore'),
    chalk  = require('chalk'),
    argv   = require('minimist')(process.argv.slice(2)),
    args   = process.argv;

//Get configs
var config = new Config(),
    kitiot = new KitIoT();

//If console option
if (argv.console) {
  kitiot.showConsole();
}

//If no config
if (_.isEmpty(config.getData())) {
  if (!argv['public-key'] || !argv.alias || !argv['public-key'] && !argv.alias) {
    console.log(chalk.red('-----------------------'));
    console.log(chalk.red('Kit-IoT-natura options:'));
    console.log(chalk.red('-----------------------'));
    console.log(chalk.yellow('  --alias'));
    console.log(chalk.yellow('  --public-key'));
    console.log(chalk.yellow('  --console'));
    console.log(chalk.red('-----------------------'));
    console.log(chalk.green('Ex: kit-iot-natura --alias="Device alias" --public-key="yourpublickey" --console'));

    process.exit(1);
  }

  config.saveData(argv);
  kitiot.connect();

} else {
  kitiot.connect();
}

