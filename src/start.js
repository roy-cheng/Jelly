'use strict';

if (!$) {
    var $ = require('../lib/jquery.js');
}

function updateLayout() {
    var $outterElement = $('#workspace');
    var $container = $('#board-container');
    $container.stop();
    $container.animate({
        width: $outterElement.width(),
        height: $outterElement.height()
    }, 120);
}

window.onresize = function () {
    updateLayout();
};

$(document).ready(function () {
    updateLayout();

    var enbx = require('../src/enbx.js');
    enbx.open('.test/test.enbx')
});
