'use strict';

var app = angular.module('ctLoginsApp.social.directives', ['ngResource']);

app.directive('social', ['CT', '$q', '$timeout', '$compile', '$window', function(CT, $q, $timeout, $compile, $window) {

  var link = function(scope, element, attrs) {

    scope.doCheckin = function() {
      scope.checkin = true;
      var options = {
        pageId: attrs.fbPageId,
        accessToken: scope.authResponse.accessToken,
        message: scope.message
      };
      CT.checkin(options).then(function() {
        redirect();
      }, function() {
        redirect();
      });
    };

    function redirect() {
      $window.location.href = scope.redirectUrl;
    }

  };

  var controller = function($scope, $element, $attrs) {

    var auth = {};

    this.$scope = $scope;

    $attrs.$observe('autoLogin', function(val){
      if (val !== '') {
        $scope.attrs = $attrs;
      }
    });

    this.setSocialName = function(name) {
      if ($scope.socialName === undefined || $scope.socialName === '') {
        $scope.socialName = name;
      }
    };

    this.doCtLogin = function() {
      formatAuthResponse();
      var deferred = $q.defer();
      var params = {
        token: auth.accessToken,
        expires: auth.expires,
        userId: auth.userID,
        memberId: auth.memberId,
        signature: auth.signature,
        signature_version: auth.signature_version,
        signature_order: auth.signature_order
      };
      CT.login(params).then(function() {
        deferred.resolve(1);
      }, function(err) {
        $scope.loggingIn = undefined;
        deferred.reject(err);
      });
      return deferred.promise;
    };

    this.autoLogin = function() {
      var deferred = $q.defer();
      $scope.loggingIn = true;
      var timeout = ($attrs.timeout > 0) ? ($attrs.timeout * 1000) : 0;
      $timeout(function() {
        deferred.resolve();
      },timeout);
      return deferred.promise;
    };

    var formatAuthResponse = function() {
      if ($scope.authResponse.member_id !== undefined) {
        auth.accessToken        = $scope.authResponse.access_token;
        auth.memberId           = $scope.authResponse.member_id;
        auth.signature_order    = $scope.authResponse.signature_order;
        auth.signature          = $scope.authResponse.signature;
        auth.signature_version  = $scope.authResponse.signature_version;
      } else if ($scope.authResponse.userID !== undefined) {
        auth.accessToken = $scope.authResponse.accessToken;
        auth.userID = $scope.authResponse.userID;
        auth.expires = $scope.authResponse.expires;
      } else if ($scope.authResponse.client_id !== undefined) {
        auth.accessToken = $scope.authResponse.access_token;
        auth.clientID = $scope.authResponse.client_id;
      }
    };

    this.compileTemplate = function(msg) {
      var templateObj = $compile('<div>' + msg +'</div>')($scope);
      $element.html(templateObj);
    };

  };

  return {
    scope: true,
    transclude: true,
    controller: controller,
    link: link,
    template:
      '<div>' +
      '<div ng-show=\'loggingIn\' class=\'small-12 medium-6 medium-centered columns alert-box success\'>Logging you in, please hold tight...</div>' +
      '<div ng-hide=\'loggingIn\'><h2 ng-if=\'socialName\'>Hey {{ socialName }}, nice to see you again.</h2>'+
      '<h2><b>Please login with one of the following.</b></h2>'+
      '<div ng-transclude></div></div>' +
      '</div>'
  };

}]);

