/**
 *
 *  Usage:
 *
 *       <notifier ></notifier>
 *
 *  @author Howard.Zuo
 *  @date Oct 26, 2014
 *
 **/
(function(global, angular, factory) {
    'use strict';

    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        global.SweetNotifier = factory();
    }

}(window, angular, function() {
    'use strict';
    var mod = angular.module('angular-sweetnotifier', []);

    var TYPES = ['info', 'success', 'warning', 'error'];

    var dir = function($rootScope, $timeout) {
        return {
            restrict: 'AE',
            link: function($scope, element) {

                $scope.items = [];

                $scope.remove = function(item) {
                    var i = $scope.items.indexOf(item);
                    if (i > -1) {
                        $scope.items.splice(i, 1);
                    }
                    $timeout.cancel(item.promiseId);
                };

                $rootScope.$watch('sweetnotifications', function() {
                    if ($rootScope.sweetnotifications && $rootScope.sweetnotifications.length > 0) {
                        var pop = $rootScope.sweetnotifications.pop();
                        var promiseId = $timeout(function() {
                            $scope.remove(pop);
                        }, pop.timeout);
                        pop.promiseId = promiseId;
                        $scope.items.push(pop);
                    }
                }, true);


                //unregister all the listener from the element
                $scope.$on('$destroy', function() {

                });
            },
            template: '<div class="notifier-wrapper" ng-repeat="item in items"><div class="notifier" ng-class="item.position"><div class="notifier-close" ng-click="remove(item)"><i class="fa fa-times fa-2x"></i></div><div class="notifier-image"><i class="fa fa-{{item.type}}"></i></div><div class="notifier-content"><h3 class="notifier-title">{{item.title}}</h3><div class="notifier-text">{{item.message}}</div></div></div></div>'
        };
    };

    var ser = function($rootScope) {

        this.push = function(note) {
            if (!note) {
                return;
            }

            var item = {
                type: 'info'
            };

            if (note.type === 'success') {
                item.type = 'check';
            } else if (note.type === 'error') {
                item.type = 'times';
            } else if (TYPES.indexOf(note.type) > -1) {
                item.type = note.type;
            }
            item.title = note.title;
            item.message = note.message;
            item.timeout = note.timeout || 5000;
            item.position = '';
            if (note.position && note.position.length > 0) {
                for (var i in note.position) {
                    item.position += note.position[i] + ' ';
                }
            }
            if (!$rootScope.sweetnotifications) {
                $rootScope.sweetnotifications = [];
            }
            $rootScope.sweetnotifications.push(item);
        };
    };

    mod.directive('notifier', ['$rootScope', '$timeout', dir]);
    mod.service('notifier', ['$rootScope', ser]);

    return mod;
}));
