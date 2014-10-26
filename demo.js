'use strict';
var demo = angular.module('demo', ['angular-sweetnotifier', 'ngAnimate']);

demo.controller('DemoController', function($scope, notifier) {

    $scope.topRight = function() {
        notifier.push({
            timeout: 100000,
            position: ['top', 'right'],
            type: 'info',
            title: 'Info',
            message: 'Time to show the message!'
        });
    };

    $scope.topLeft = function() {
        notifier.push({
            timeout: 100000,
            position: ['top', 'left'],
            type: 'warning',
            title: 'Warning',
            message: 'You shouldn\'t do this!'
        });
    };

    $scope.middleRight = function() {
        notifier.push({
            timeout: 100000,
            position: ['middle', 'right'],
            type: 'success',
            title: 'Success',
            message: 'Congratulations!'
        });
    };

    $scope.middleLeft = function() {
        notifier.push({
            timeout: 100000,
            position: ['middle', 'left'],
            type: 'error',
            title: 'Error',
            message: 'What you\'ve done is incorrect!'
        });
    };

    $scope.bottomRight = function() {
        notifier.push({
            timeout: 100000,
            position: ['bottom', 'right'],
            type: 'info',
            title: 'Info',
            message: 'Hi, i am here!'
        });
    };

    $scope.bottomLeft = function() {
        notifier.push({
            timeout: 100000,
            position: ['bottom', 'left'],
            type: 'warning',
            title: 'Warning',
            message: 'What\'s going on?'
        });
    };
});
