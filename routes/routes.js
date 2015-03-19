var request = require('request'),
    URL     = 'http://dca.telefonicabeta.com',
    token   = require('../lib/token');
    t       = new token();

var routes = function (app) {
  //Main
  app.get('/', function (req, res) {
    res.render('index.html');
  });

  //Login
  app.post('/login', function (req, res) {
    //validate the form
    req.checkBody('username', 'Usuário inválido').notEmpty();
    req.checkBody('password', 'Senha inválido').notEmpty();
    req.checkBody('service', 'Service inválido').notEmpty();
    req.checkBody('apikey', 'API Key inválida').notEmpty();

    var errors = req.validationErrors(),
        mapErrors = req.validationErrors(true);

    if (!errors) {
      request({
        url: URL +'/m2m/v2/services/'+ req.body.service

      }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
          //Save user configuration
          t.saveConfig({
            "username": req.body.username,
            "password": req.body.password,
            "apikey"  : req.body.apikey,
            "service" : req.body.service
          });

          res.send(body);

        } else if (!error && response.statusCode === 404) {
          var errorMessage = {
            param: 'service',
            msg  : 'Service inválido',
            value: req.body.service
          };

          res.send({
            errors: [errorMessage],
            mapErrors: {
              service: errorMessage
            }
          });

        } else {
          res.send({ error: error });
        }
      });

    } else {
      res.send({
        errors: errors,
        mapErrors: mapErrors
      });
    }
  });
};

module.exports = routes;

