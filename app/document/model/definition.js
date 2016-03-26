'use strict';

let core = require('./core');

let definitions = {};

let dt = Object.assign({}, core.types, {
    brush: e => e.getElementsByTagName('ColorBrush')[0].innerHTML.substr(3),
    geometry: e => e.getElementsByTagName('PresetGeometry')[0].getElementsByTagName('GeometryType')[0].innerHTML,
    res: 'res'
});

function defineElement() {
    var elementBaseDefinition = {
        id: dt.string,
        x: dt.float,
        y: dt.float,
        width: dt.float,
        height: dt.float,
        rotation: dt.float,
        isLocked: dt.boolean,
        canClone: dt.boolean
    };

    if (arguments.length === 0) {
        return elementBaseDefinition;
    }

    return Object.assign(elementBaseDefinition, arguments[0]);
}

definitions['Reference'] = {
    relationships: dt.array(dt.model(
        'Relationship',
        {
            id: dt.string,
            target: dt.string
        }))
};
definitions['Board'] = {
    slides: dt.array(dt.string)
};
definitions['Slide'] = {
    id: dt.string,
    width: dt.float,
    height: dt.float,
    background: dt.brush,
    elements: dt.array(dt.model())
};
definitions['Shape'] = defineElement({
    background: dt.brush,
    foreground: dt.brush,
    thickness: dt.float,
    opacity: dt.float,
    geometry: dt.geometry
});
definitions['Picture'] = defineElement({
    source: dt.res,
    pictureName: dt.string,
    alpha: dt.float,
    isTexture: dt.boolean,
    displayRegion: dt.string
});
definitions['Text'] = defineElement({
    richText: dt.model(
        'RichText',
        {
            text: dt.string,
            sizeToContent: dt.string,
            verticalTextAlignment: dt.string,
            textLines: dt.array(dt.model(
                'TextLine',
                {
                    indentLevel: dt.int,
                    lineSpacing: dt.float,
                    textAlignment: dt.string,
                    textMarker: dt.string,
                    textRuns: dt.array(dt.model(
                        'TextRun',
                        {
                            text: dt.string,
                            fontSize: dt.float,
                            fontVariants: dt.string,
                            fontStyle: dt.string,
                            fontWeight: dt.string,
                            fontFamily: dt.string,
                            background: dt.brush,
                            foreground: dt.brush
                        }))
                }))
        })
});

module.exports = definitions;