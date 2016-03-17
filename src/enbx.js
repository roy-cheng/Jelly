var fs = require('fs'),
    xml2js = require('xml2js'),
    unzip = require('unzip'),
    Snap = require('snapsvg'),
    path = require('path');

var unzipDir = '.test/test.enbx.unzip/';
function rel(p){
    return path.resolve(unzipDir + p);
}

function open(file) {
    parseReference(refs=>{
        fs.createReadStream(file).pipe(unzip.Extract({path: unzipDir}).on('close', function () {
            fs.readFile(rel('Slides/Slide_0.xml'), function (err, data) {
                parseSlide(data, refs);
            });
        }));
    });
}

function parseSlide(slideXmlString, refs) {
    var parser = new DOMParser();
    var xmlDom = parser.parseFromString(slideXmlString, 'text/xml');
    var slide = xmlDom.documentElement;
    var elements = slide.getElementsByTagName('Elements')[0].childNodes;
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].nodeType !== 1)
            continue;
        try {
            parseElement(elements[i], refs);
        } catch (err) {
            console.log('Parsing failed:' + err.toString());
            console.log(elements[i]);
        }
    }
    drawGrid();
}

function parseElement(element, refs) {
    var table = {
        Text: parseText,
        Shape: parseShape,
        Picture: parsePicture
    };
    table[element.tagName](element, refs);
}

function parseText(element) {
    xml2js.parseString(element.outerHTML, function (err, result) {
        var data = result.Text;
        var model = {
            x: parseFloat(data.X[0]),
            y: parseFloat(data.Y[0]),
            width: parseFloat(data.Width[0]),
            height: parseFloat(data.Height[0]),
        }
        var richTextModel = data.RichText[0];
        model.text = richTextModel.Text[0];
        model.textLines = [];
        var textLineModels = richTextModel.TextLines[0].TextLine;
        for (var i = 0; i < textLineModels.length; i++) {
            var textLine = {textRuns: []};
            model.textLines.push(textLine);
            var textRunModels = textLineModels[i].TextRuns[0].TextRun;
            for (var j = 0; j < textRunModels.length; j++) {
                var textRunModel = textRunModels[j];
                var textRun = {
                    text: textRunModel.Text[0],
                    fontSize: textRunModel.FontSize[0],
                    fontFamily: textRunModel.FontFamily[0],
                    background: color(textRunModel.Background[0]),
                    foreground: color(textRunModel.Foreground[0]),
                };
                textLine.textRuns.push(textRun);
            }
        }
        var s = Snap('#board');
        for (var i = 0; i < model.textLines.length; i++) {
            var line = model.textLines[i];
            var texts = line.textRuns.map(function (x) {
                return x.text
            });
            var t = s.text(model.x, model.x, texts);
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
                x: model.x + (model.x - box.x),
                y: model.y + (model.y - box.y)
            });
        }
    });
}

function parseShape(element) {
    xml2js.parseString(element.outerHTML, function (err, result) {
        var data = result.Shape;
        var model = {
            x: parseFloat(data.X[0]),
            y: parseFloat(data.Y[0]),
            width: parseFloat(data.Width[0]),
            height: parseFloat(data.Height[0]),
            background: color(data.Background[0]),
            foreground: color(data.Foreground[0]),
            thickness: parseFloat(data.Thickness[0]),
        };

        var s = Snap('#board');
        var rect = s.rect(model.x, model.y, model.width, model.height);
        rect.attr({
            fill: model.background,
            stroke: model.foreground,
            strokeWidth: model.thickness
        });
    });
}

function parsePicture(element, refs) {
    xml2js.parseString(element.outerHTML, function (err, result) {
        var data = result.Picture;
        var model = {
            x: parseFloat(data.X[0]),
            y: parseFloat(data.Y[0]),
            width: parseFloat(data.Width[0]),
            height: parseFloat(data.Height[0]),
            pictureName: data.PictureName[0],
            source: rel(refs[data.Source[0].substr(5)]),
        };

        var s = Snap('#board');
        var rect = s.image(model.source, model.x, model.y, model.width, model.height);
        //rect.attr({
        //    fill: model.background,
        //    stroke: model.foreground,
        //    strokeWidth: model.thickness
        //});
    });
}

function parseReference(func) {
    fs.readFile('.test/test.enbx.unzip/Reference.xml', function (err, data) {
        xml2js.parseString(data, function (err, result) {
            var reference = result.Reference;
            if (typeof reference.Relationships != "undefined") {
                var relationships = reference.Relationships[0].Relationship;
                var refs = [];
                for (var i = 0; i < relationships.length; i++) {
                    var r = relationships[i];
                    refs[r.Id[0]] = r.Target[0];
                }
            }
            if (typeof func != "undefined") {
                func(refs);
            }
        });
    });

}

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

function color(element) {
    return element.ColorBrush[0].substr(3);
}

exports.open = open;
