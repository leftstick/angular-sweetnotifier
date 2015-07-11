/**
 *
 *  @author Howard.Zuo
 *  @date July 9, 2015
 *
 **/
(function(global, factory) {
    'use strict';

    if (typeof exports === 'object') {
        module.exports = factory(require('angular'));
    } else if (typeof define === 'function' && define.amd) {
        define(['angular'], factory);
    } else {
        factory(global.angular);
    }

}(window, function(ng) {
    'use strict';
    var name = 'angular-sweetnotifier';

    var hash = function(str) {
        var hash = 5381;
        var i = str.length;

        while (i) {
            hash = (hash * 33) ^ str.charCodeAt(--i);
        }
        return hash >>> 0;
    };

    var Native = window.Notification || window.mozNotification || window.webkitNotification;
    if (Native) {
        //request permisstion once app launched
        Native.requestPermission(function() {});
    }

    var mod = ng.module(name, []);

    var TYPES = [
        'info',
        'success',
        'warning',
        'error'
    ];

    var VERTICAL_OPTS = ['top', 'middle', 'bottom'];
    var HORIZONTAL_OPTS = ['left', 'center', 'right'];

    var PLACEMENTS = {};
    PLACEMENTS[hash('top') & hash('left')] = 'top-left';
    PLACEMENTS[hash('top') & hash('center')] = 'top-center';
    PLACEMENTS[hash('top') & hash('right')] = 'top-right';
    PLACEMENTS[hash('middle') & hash('left')] = 'middle-left';
    PLACEMENTS[hash('middle') & hash('center')] = 'middle-center';
    PLACEMENTS[hash('middle') & hash('right')] = 'middle-right';
    PLACEMENTS[hash('bottom') & hash('left')] = 'bottom-left';
    PLACEMENTS[hash('bottom') & hash('center')] = 'bottom-center';
    PLACEMENTS[hash('bottom') & hash('right')] = 'bottom-right';

    var defaults = {
        type: 'info',
        useNative: true,
        timeout: 5000,
        title: '',
        content: ''
    };

    var placement = hash('top') & hash('center');

    mod.provider('notifier', function() {

        this.setPlacement = function() {
            var args = Array.prototype.slice.call(arguments);
            if (args.length === 0) {
                return;
            }

            if (args.length === 1) {
                if (VERTICAL_OPTS.indexOf(args[0]) > -1) {
                    placement = hash(args[0]) & hash('center');
                    return;
                }
                if (HORIZONTAL_OPTS.indexOf(args[0]) > -1) {
                    placement = hash('top') & hash(args[0]);
                    return;
                }
            }

            if (VERTICAL_OPTS.indexOf(args[0]) > -1) {
                placement = hash(args[0]) & (HORIZONTAL_OPTS.indexOf(args[1]) > -1 ? hash(args[1]) : hash('center'));
                return;
            }

            if (HORIZONTAL_OPTS.indexOf(args[0]) > -1) {
                placement = (VERTICAL_OPTS.indexOf(args[1]) > -1 ? hash(args[1]) : hash('top')) & hash(args[0]);
                return;
            }

            if (VERTICAL_OPTS.indexOf(args[1]) > -1) {
                placement = hash(args[1]) & (HORIZONTAL_OPTS.indexOf(args[0]) > -1 ? hash(args[0]) : hash('center'));
                return;
            }

            if (HORIZONTAL_OPTS.indexOf(args[1]) > -1) {
                placement = (VERTICAL_OPTS.indexOf(args[0]) > -1 ? hash(args[0]) : hash('top')) & hash(args[1]);
                return;
            }
        };

        this.$get = [
            '$rootScope',
            function($rootScope) {
                var emit = function(opts) {
                    $rootScope.$broadcast('newsweetnotification', ng.merge({}, defaults, opts));
                };
                return {emit: emit};
            }
        ];
    });

    var dir = function($rootScope, $timeout) {
        return {
            restrict: 'E',
            link: function($scope) {

                $scope.items = [];
                $scope.placement = PLACEMENTS[placement];

                $scope.remove = function(item) {
                    var i = $scope.items.indexOf(item);
                    if (i > -1) {
                        $scope.items.splice(i, 1);
                    }
                    $timeout.cancel(item.promiseId);
                };

                $rootScope.$on('newsweetnotification', function(event, options) {
                    if (options.useNative && Native) {
                        new Native(
                            options.title, {
                                body: options.content,
                                dir: 'auto', // or ltr, rtl
                                lang: 'en-US', //lang used within the notification.
                                tag: 'notificationPopup',
                                icon: options.icon
                            }
                        );
                        return;
                    }
                    var item = {
                        title: options.title,
                        content: options.content,
                        type: TYPES.indexOf(options.type) < 0 ? TYPES[0] : options.type,
                        promiseId: $timeout(function() {
                            $scope.remove(item);
                        }, options.timeout)
                    };
                    $scope.items.unshift(item);
                });

                //unregister all the listener from the element
                $scope.$on('$destroy', function() {});
            },
            template: '<div class="sweetnotifier-wrapper" ng-class="placement">    <div class="sweetnotifier" ng-repeat="item in items">        <div class="sweetnotifier-close" ng-click="remove(item)">            <i class="icon-close"></i>        </div>        <div class="sweetnotifier-image"><i class="icon-{{item.type}}"></i></div>        <div class="sweetnotifier-content">            <h3 class="sweetnotifier-title">{{item.title}}</h3>            <div class="sweetnotifier-text">{{item.content}}</div>        </div>    </div></div>'
        };
    };

    mod.directive('sweetnotifier', ['$rootScope', '$timeout', dir]);

    return name;
}));
