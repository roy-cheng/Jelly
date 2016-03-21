'use strict';

var fs = require('fs'),
    unzip = require('unzip'),
    path = require('path');

function EnbxDocument(repo) {
}
EnbxDocument.fromFile = function (enbxFile, func) {
    var unzipDir = '.test/' + Date.now().toString() + '/';
    fs.mkdirSync(unzipDir);

    function rel(p) {
        return path.resolve(unzipDir + p);
    }

    fs.createReadStream(enbxFile).pipe(unzip.Extract({path: unzipDir}).on('close', function () {
        var slideDir = rel('slides');
        fs.readdir(slideDir, function (err, slideFiles) {
            if (err) {
                throw err;
            }

            var doc = new EnbxDocument();
            doc.slides = [];

            slideFiles = slideFiles.map(f => path.join(slideDir, f))
                .filter(f => fs.statSync(f).isFile());
            slideFiles.sort((s1, s2) => {
                s1 = s1.replace(/^.*[\\\/]/, '').replace(/^Slide_([\d]+).xml$/i, '$1');
                s2 = s2.replace(/^.*[\\\/]/, '').replace(/^Slide_([\d]+).xml$/i, '$1');
                return parseInt(s1) - parseInt(s2);
            });
            var boardFile = rel('board.xml');
            var refFile = rel('reference.xml');
            var checkRenturn = () => {
                if (doc.board && doc.refs && doc.slides.length == slideFiles.length
                    && doc.slides.every(x => x)) {
                    console.log(doc);
                    func(doc);
                }
            };
            readXmlFile(refFile, model => {
                doc.refs = model;
                var dict = [];
                if (typeof model.relationships !== 'undefined') {
                    for (var r of model.relationships) {
                        dict[r.id] = r.target;
                    }
                }
                console.log(dict)
                doc.refs.resolve = s => {
                    if (typeof s === 'defined') {
                        console.log('error')
                    }
                    return rel(dict[s.substr(5)]);
                }
                checkRenturn();
            });
            readXmlFile(boardFile, model => {
                doc.board = model;
                checkRenturn();
            });
            for (let i = 0; i < slideFiles.length; i++) {
                readXmlFile(slideFiles[i], model => {
                    doc.slides[i] = model;
                    model._f = slideFiles[i];
                    checkRenturn();
                });
            }
        });
    }));
}

function readXmlFile(file, func) {
    fs.readFile(file, 'utf8', function (err, data) {
        var parser = new DOMParser();
        var xmlDom = parser.parseFromString(data, 'text/xml');
        var m = createModel(xmlDom.documentElement);
        func(m);
    });
}

var dataType = {
    int: e => parseInt(e.innerHTML),
    float: e => parseFloat(e.innerHTML),
    boolean: e => e.innerHTML.toLowerCase() == 'true',
    string: e => e.innerHTML,
    brush: e => e.getElementsByTagName('ColorBrush')[0].innerHTML.substr(3),
    geometry: e => e.getElementsByTagName('PresetGeometry')[0].getElementsByTagName('GeometryType')[0].innerHTML,
    model: modelOf,
    arrayOf: arrayOf
};

function modelOf(type, definition) {
    if (typeof Element !== 'undefined' && type instanceof Element) {
        return createModel(type);
    }
    else {
        return function (element) {
            return new Model(type, element, definition);
        }
    }
}

function arrayOf(type) {
    return function (element) {
        return Array.prototype.slice.call(element.children).map(x => type(x));
    }
}

function createModel(xmlElement, type) {
    type = type || xmlElement.tagName;
    var def = definitions[type];
    if (typeof def === 'undefined') {
        console.log('undefined type: ' + type);
        return new Model(type);
    }
    else {
        return new Model(type, xmlElement, definitions[type]);
    }
}

function Model(type, xmlElement, definition) {
    this['_type'] = type;

    if (typeof xmlElement === 'undefined') {
        return;
    }

    for (var i = 0; i < xmlElement.children.length; i++) {
        var childElement = xmlElement.children[i];
        var tagName = childElement.tagName;
        var fieldName = tagName.slice(0, 1).toLowerCase() + tagName.slice(1);
        var converter = definition[fieldName];

        if (typeof converter !== 'undefined') {
            this[fieldName] = converter(childElement);
        }
    }
}

function defineElement() {
    var elementBaseDefinition = {
        id: dataType.string,
        x: dataType.float,
        y: dataType.float,
        width: dataType.float,
        height: dataType.float,
        rotation: dataType.float,
        isLocked: dataType.boolean,
        canClone: dataType.boolean
    };

    if (arguments.length === 0) {
        return elementBaseDefinition;
    }

    return Object.assign(elementBaseDefinition, arguments[0]);
}

var definitions = [];
definitions['Reference'] = {
    relationships: dataType.arrayOf(dataType.model(
        'Relationship',
        {
            id: dataType.string,
            target: dataType.string
        }))
};
definitions['Board'] = {
    slides: dataType.arrayOf(dataType.string)
};
definitions['Slide'] = {
    id: dataType.string,
    width: dataType.float,
    height: dataType.float,
    background: dataType.brush,
    elements: dataType.arrayOf(dataType.model)
};
definitions['Shape'] = defineElement({
    background: dataType.brush,
    foreground: dataType.brush,
    thickness: dataType.float,
    opacity: dataType.float,
    geometry: dataType.geometry
});
definitions['Picture'] = defineElement({
    source: dataType.string,
    pictureName: dataType.string,
    alpha: dataType.float,
    isTexture: dataType.boolean,
    displayRegion: dataType.string
});
definitions['Text'] = defineElement({
    richText: dataType.model(
        'RichText',
        {
            text: dataType.string,
            sizeToContent: dataType.string,
            verticalTextAlignment: dataType.string,
            textLines: dataType.arrayOf(dataType.model(
                'TextLine',
                {
                    indentLevel: dataType.int,
                    lineSpacing: dataType.float,
                    textAlignment: dataType.string,
                    textMarker: dataType.string,
                    textRuns: dataType.arrayOf(dataType.model(
                        'TextRun',
                        {
                            text: dataType.string,
                            fontSize: dataType.float,
                            fontVariants: dataType.string,
                            fontStyle: dataType.string,
                            fontWeight: dataType.string,
                            fontFamily: dataType.string,
                            background: dataType.brush,
                            foreground: dataType.brush
                        }))
                }))
        })
});

exports.EnbxDocument = EnbxDocument;