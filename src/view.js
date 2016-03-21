'use strict';

var Snap = require('snapsvg');

function drawGrid() {
    var s = Snap('#board');
    for (var x = 20; x < 1280; x += 20) {
        var line = s.line(x, 0, x, 720);
        line.attr({
            stroke: "888",
            strokeWidth: 1
        });
        if (x % 100 == 0) {
            line.attr({
                stroke: "000",
                strokeWidth: 2
            });
        }
        if (x % 500 == 0) {
            line.attr({
                strokeWidth: 6
            });
        }
    }
    for (var y = 20; y < 720; y += 20) {
        var line = s.line(0, y, 1280, y);
        line.attr({
            stroke: "888",
            strokeWidth: 1
        });
        if (y % 100 == 0) {
            line.attr({
                stroke: "000",
                strokeWidth: 2
            });
        }
        if (y % 500 == 0) {
            line.attr({
                strokeWidth: 6
            });
        }
    }
}

function render(slideModel, refs) {
    var s = new Snap('#board');
    s.clear();
    var background = s.rect(0, 0, 1280, 720);
    background.attr({ fill: slideModel.background });
    for (var element of slideModel.elements) {
        drawElement(s, element, refs);
    }
    //drawGrid();
}

function drawElement(s, element, refs) {
    var table = {
        Text: drawText,
        Shape: drawShape,
        Picture: drawPicture
    };
    var draw = table[element._type];
    if (typeof draw !== 'undefined')
        draw(s, element, refs);
}

function drawShape(s, m) {
    var shape = null;
    switch (m.geometry) {
        case 'Rectangle':
            shape = s.rect(m.x, m.y, m.width, m.height);
            break;
        case 'Circle':
            shape = s.ellipse(m.x + m.width / 2, m.y + m.height / 2, m.width / 2, m.height / 2);
            break;
    }
    if (shape) {
        shape.attr({
            fill: m.background,
            stroke: m.foreground,
            strokeWidth: m.thickness
        });
    }
}

function drawPicture(s, m, refs) {
    s.image(refs.resolve(m.source), m.x, m.y, m.width, m.height);
}

function drawText(s, m) {
    console.log(m);
    var left = m.x + 10;
    var top = 10 + m.y;
    for (var i = 0; i < m.richText.textLines.length; i++) {
        var line = m.richText.textLines[i];
        if (typeof line.textRuns === 'undefined') {
            continue;
        }
        var textRunInnerStrings = line.textRuns.map(function(x) {
            return x.text
        });
        var text = s.text(left, 0, textRunInnerStrings);
        for (var j = 0; j < line.textRuns.length; j++) {
            var runModel = line.textRuns[j];
            var run = text.selectAll('tspan:nth-child(' + (j + 1) + ')');
            run.attr({
                fill: runModel.foreground,
                'font-size': runModel.fontSize,
                'font-family': runModel.fontFamily
            });
        }
        console.log('line'+i)
        console.log(top);
        var box = text.getBBox();
        text.attr({
            y: top - box.y
        });
        top = top+box.height*1.1;
        console.log(top);
    }
}

function renderThumbnails(models, refs) {
    var $panel = $('#thumbnails ul');
    
    for (let m of models) {
        var $svg = $('<svg viewBox="0 0 1280 720"></svg>');
        let $li = $('<li class="slide-thumbnail"></li>');
        $panel.append($li);
        $li.append($svg);
        var s = new Snap($svg[0]);
        var background = s.rect(0, 0, 1280, 720);
        background.attr({ fill: m.background });

        for (var element of m.elements) {
            drawElement(s, element, refs);
        }

        $li.click(() => {
            render(m, refs);
            $('#thumbnails li').removeClass('active');
            $li.addClass('active');
        });
    }
    $('#thumbnails li:first').addClass('active');
}

exports.render = render;
exports.renderThumbnails = renderThumbnails;