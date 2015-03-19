//Main controller
app.controller('mainCtrl', function ($scope, socket, $http, $location, Auth, Storage) {
  'use strict';

  $scope.loginUser = function () {
    $scope.loading = true;

    $http.post('/login', {
      name : $scope.name,
      email: $scope.email,
      username: $scope.username,
      password: $scope.password,
      service: $scope.service,
      apikey: $scope.apikey
    })
    .success(function (data, status, headers) {

      $scope.loading = false;

      if(data.errors) {
        $scope.errors = data.errors;
        $scope.error = null;

      } else if (data.error) {
        $scope.errors = $scope.error = null;

        if (data.error.code === 'EHOSTUNREACH') {
          $scope.error = {
            'msg': 'Sem conexão com a internet'
          };
        } else {
          $scope.error = data.error;
        }

      } else if (data.exceptionId) {
        $scope.errors = $scope.error = null;

        $scope.error = {
          'msg': 'Erro ao autenticar o token'
        };
        $scope.mapErrors = {
          'service': 'Erro ao autenticar o token',
        };

      } else {
        $scope.errors = $scope.error = null;
        Auth.login($scope.username, $scope.password, $scope.service, $scope.apikey);

        $location.path('/dashboard');
      }

    })
    .error(function (data, status) {
       $scope.loading = false;
    });
  };
});
