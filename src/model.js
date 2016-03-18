var dataType = {
    int: e=> parseInt(e.innerHTML),
    float: e=> parseFloat(e.innerHTML),
    boolean: e=> e.innerHTML.toLowerCase() == 'true',
    string: e=> e.innerHTML,
    brush: e=> e.getElementsByTagName('ColorBrush')[0].innerHTML.substr(3),
    geometry: e=> e.getElementsByTagName('PresetGeometry')[0].getElementsByTagName('GeometryType')[0].innerHTML,
    model: modelOf,
    arrayOf: arrayOf
};

function modelOf(type, definition) {
    if (type.constructor.name === 'Element') {
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
        return Array.prototype.slice.call(element.children).map(x=>type(x));
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

exports.createModel = createModel;