function drawGrid() {
    var s = Snap('#board');
    for (var x = 100; x < 1280; x += 100) {
        var line = s.line(x, 0, x, 720);
        line.attr({
            stroke: "888",
            strokeWidth: 1
        });
        if (x % 250 == 0) {
            line.attr({
                stroke: "000"
            });
        }
    }
    for (var y = 100; y < 720; y += 100) {
        var line = s.line(0, y, 1280, y);
        line.attr({
            stroke: "888",
            strokeWidth: 1
        });
        if (y % 250 == 0) {
            line.attr({
                stroke: "000"
            });
        }
    }
}

function render(slideModel, refs){
    $('#slide g').attr({fill: '#' + slideModel.background});

    for(var element of slideModel.elements){
        console.log(element)
        drawElement(element, refs);
    }

    drawGrid();
}

function drawElement(element, refs){
    var table = {
        Text: drawText,
        Shape: drawShape,
        Picture: drawPicture
    };
    var draw = table[element._type];
    if(typeof draw !== 'undefined')
        draw(element, refs);
}

function drawShape(m){
    var s = Snap('#board');
    var shape = null;
    switch (m.geometry){
        case 'Rectangle':
            shape = s.rect(m.x, m.y, m.width, m.height);
            break;
        case 'Circle':
            shape = s.ellipse(m.x+m.width/2, m.y+m.height/2, m.width/2, m.height/2);
            break;
    }
    if(shape){
        shape.attr({
            fill: m.background,
            stroke: m.foreground,
            strokeWidth: m.thickness
        });
    }
}

function drawPicture(m, refs){
    var s = Snap('#board');
    s.image(refs.resolve(m.source), m.x, m.y, m.width, m.height);
}

function drawText(m){
    var s = Snap('#board');
    for (var i = 0; i < m.richText.textLines.length; i++) {
        var line = m.richText.textLines[i];
        var texts = line.textRuns.map(function (x) {
            return x.text
        });
        var t = s.text(m.x, m.y, texts);
        for (var j = 0; j < line.textRuns.length; j++) {
            var run = line.textRuns[j];
            t.selectAll('tspan:nth-child(' + (j + 1) + ')').attr({
                fill: run.foreground,
                'font-size': run.fontSize,
                'font-family': run.fontFamily
            });
        }
        var box = t.getBBox();
        t.attr({
            x: m.x + (m.x - box.x),
            y: m.y + (m.y - box.y)
        });
    }
}

exports.render = render;