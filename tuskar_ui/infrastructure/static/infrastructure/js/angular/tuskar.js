window.name ='NG_DEFER_BOOTSTRAP!'

var Tuskar = angular.module('tuskar', ['ngTable'])
  .config(['$interpolateProvider', '$httpProvider',
    function ($interpolateProvider, $httpProvider) {
      $interpolateProvider.startSymbol('{$');
      $interpolateProvider.endSymbol('$}');
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    }]);

angular.element(document).ready(function () {
  console.log(window);
  angular.resumeBootstrap(['tuskar']);
 });
