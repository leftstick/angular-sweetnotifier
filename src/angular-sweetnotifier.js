/**
 *
 *  @author Howard.Zuo
 *  @date July 10, 2015
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
        useNative: false,
        timeout: 15000,
        title: '',
        content: ''
    };

    var placement = hash('top') & hash('center');
    var nativeWhileBlur = true;
    var nativeIcons;
    var winBlur = false;

    var setPlacement = function(pos) {
        var args = [];
        ng.forEach(pos, function(i) {
            this.push(i.replace(/ /g, ''));
        }, args);

        if (args.length === 0) {
            return;
        }

        if (args.length === 1) {
            if (VERTICAL_OPTS.indexOf(args[0]) > -1) {
                return hash(args[0]) & hash('center');
            }
            if (HORIZONTAL_OPTS.indexOf(args[0]) > -1) {
                return hash('top') & hash(args[0]);
            }
        }

        if (VERTICAL_OPTS.indexOf(args[0]) > -1) {
            return hash(args[0]) & (HORIZONTAL_OPTS.indexOf(args[1]) > -1 ? hash(args[1]) : hash('center'));
        }

        if (HORIZONTAL_OPTS.indexOf(args[0]) > -1) {
            return (VERTICAL_OPTS.indexOf(args[1]) > -1 ? hash(args[1]) : hash('top')) & hash(args[0]);

        }

        if (VERTICAL_OPTS.indexOf(args[1]) > -1) {
            return hash(args[1]) & (HORIZONTAL_OPTS.indexOf(args[0]) > -1 ? hash(args[0]) : hash('center'));
        }

        if (HORIZONTAL_OPTS.indexOf(args[1]) > -1) {
            return (VERTICAL_OPTS.indexOf(args[0]) > -1 ? hash(args[0]) : hash('top')) & hash(args[1]);
        }
    };

    mod.provider('notifier', function() {

        this.setPlacement = function() {
            var args = Array.prototype.slice.call(arguments);
            var pos = setPlacement(args);
            if (pos) {
                placement = pos;
            }
        };

        this.setUseNativeWhileBlur = function(bool) {
            nativeWhileBlur = !!bool;
        };

        this.setNativeIcons = function(ni) {
            if (ng.isObject(ni)) {
                nativeIcons = ni;
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

    var dir = function($rootScope, $timeout, $window) {
        return {
            restrict: 'E',
            link: function($scope, element, attrs) {

                var blur = function() {
                    winBlur = true;
                };
                var focus = function() {
                    winBlur = false;
                };
                var $win = ng.element($window);

                $win.on('blur', blur);
                $win.on('focus', focus);

                $scope.items = [];
                $scope.placement = PLACEMENTS[placement];

                attrs.$observe('placement', function(newValue) {
                    if (typeof newValue === 'undefined' || newValue === '') {
                        return;
                    }
                    var pos = setPlacement(newValue.split(','));
                    if (pos) {
                        placement = PLACEMENTS[pos];
                        $scope.placement = placement;
                    }
                });

                attrs.$observe('useNativeWhileBlur', function(newValue) {
                    if (typeof newValue === 'undefined' || newValue === '') {
                        return;
                    }
                    nativeWhileBlur = newValue === 'true';
                });

                attrs.$observe('nativeIcons', function(newValue) {
                    if (typeof newValue === 'undefined' || newValue === '') {
                        return;
                    }
                    try {
                        nativeIcons = JSON.parse(newValue);
                    } catch (e) {}
                });

                $scope.remove = function(item) {
                    var i = $scope.items.indexOf(item);
                    if (i > -1) {
                        $scope.items.splice(i, 1);
                    }
                    $timeout.cancel(item.promiseId);
                };

                $rootScope.$on('newsweetnotification', function(event, options) {
                    if ((options.useNative || (nativeWhileBlur && winBlur)) && Native) {
                        new Native(
                            options.title, {
                                body: options.content,
                                dir: 'auto', // or ltr, rtl
                                lang: 'en-US', //lang used within the notification.
                                tag: 'notificationPopup',
                                icon: nativeIcons ? nativeIcons[options.type] : ''
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
                $scope.$on('$destroy', function() {
                    $win.off('blur', blur);
                    $win.off('focus', focus);
                });
            },
            template: '<%= template %>'
        };
    };

    mod.directive('sweetnotifier', [
        '$rootScope',
        '$timeout',
        '$window',
        dir
    ]);

    return name;
}));
