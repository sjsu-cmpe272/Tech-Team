angular.module('clasiroutes', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/clasi-details', {templateUrl: 'details.html',   controller: ClasiDetailCtrl}).
            otherwise({redirectTo: '/'});
}]);