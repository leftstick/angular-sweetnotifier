'use strict';

var matrix = angular.module('matrix', [
    'angular-sweetnotifier',
    'ngAnimate'
]);

var TYPES = [
    'info',
    'error',
    'warning',
    'success'
];

var getType = function() {
    return TYPES[Math.floor(Math.random() * (3 + 1))];
};

matrix.controller('MatrixController', function($scope, notifier) {
    $scope.notify = function(ver, hor) {
        $scope.placement = ver + ',' + hor;
        var type = getType();
        notifier.emit({
            type: type,
            timeout: 3000,
            title: type,
            content: 'This is an ' + type + ' notification!'
        });
    };
});
var $win = $(window);

var updateTooltip = function() {
    if ($win.width() >= 768) {
        $('.tooltip').tooltipster({position: 'right'});
    } else {
        $('.tooltip').tooltipster('destroy');
    }
};

updateTooltip();

$win.on('resize', updateTooltip);

$('.matrix ul li').on('mouseenter', function() {
    $(this).addClass('z-depth-5');
});
$('.matrix ul li').on('mouseleave', function() {
    $(this).removeClass('z-depth-5');
});
