'use strict';

let data = {};
(function() {
    class Model {
        constructor(typeName) {
            this._type = typeName;
        }
    }
    class ModelFactory {
        constructor(definitions, dataConverters) {
            this.definitions = definitions;
            this.dataConverters = dataConverters;
        }
        create(xmlElement, typeName, definition, converters) {
            if (!xmlElement) {
                return null;
            }
            typeName = typeName || xmlElement.tagName;
            definition = definition || this.definitions[typeName];
            if (!definition) {
                console.warn('undefined type: ' + typeName);
                return null;
            }
            let model = new Model(typeName);
            for (let i = 0; i < xmlElement.children.length; i++) {
                let childElement = xmlElement.children[i];
                let fieldName = childElement.tagName.slice(0, 1).toLowerCase() + childElement.tagName.slice(1);
                let fieldType = definition[fieldName];
                if (fieldType) {
                    let converter;
                    if (converters) {
                        converter = converters.getFor(fieldType);
                    }
                    if (!converter) {
                        converter = this.dataConverters.getFor(fieldType);
                    }

                    if (converter) {
                        model[fieldName] = converter(childElement, converters);
                    }
                    else {
                        console.warn('undefined data type: ' + fieldType);
                    }
                }
                else {
                    console.warn('undefined field: ' + fieldName);
                }

                if (typeof converter !== 'undefined') {
                    this[fieldName] = converter(childElement);
                }
            }
            return model;
        }
    }
    class ConverterToolkit {
        constructor() {
            this.converters = ConverterToolkit.defaultConverters();
            this.add('array', t => (e, converters) => {
                let conv = this.getFor(t);
                return Array.prototype.slice.call(e.children).map(x => conv(x, converters));
            });
        }
        add(type, converter) {
            this.converters[type] = converter;
        }
        getFor(type) {
            let typeOfArg = typeof type;
            if (typeOfArg == 'function') {
                return type;
            }

            if (typeOfArg == 'object') {
                return this.converters[type.type](type.arguments);
            }
            else if (typeOfArg === 'string') {
                return this.converters[type];
            }
            else {
                return undefined;
            }
        }
        static defaultConverters() {
            return {
                int: e => parseInt(e.innerHTML),
                float: e => parseFloat(e.innerHTML),
                boolean: e => e.innerHTML.toLowerCase() == 'true',
                string: e => e.innerHTML
            }
        }
    }
    function arrayToken(type){
        return { type: 'array', arguments: type };
    }
    function modelToken(typeName, definition){
        return { type: 'model', arguments: { typeName, definition } };
    }
    const std = {
        int: 'int',
        float: 'float',
        boolean: 'boolean',
        string: 'string',
        model: modelToken,
        array: arrayToken
    }

    data.ModelFactory = ModelFactory;
    data.ConverterToolkit = ConverterToolkit;
    data.types = std;
})();

let definitions = {};
(function() {
    let dt = Object.assign({}, data.types, {
        brush: e => e.getElementsByTagName('ColorBrush')[0].innerHTML.substr(3),
        geometry: e => e.getElementsByTagName('PresetGeometry')[0].getElementsByTagName('GeometryType')[0].innerHTML,
        res: 'res'
    });
    // console.log(data.types);

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
})();

(function() {
    let enbxModelDefinitions = definitions;
    let converters = new data.ConverterToolkit();
    let factory = new data.ModelFactory(definitions, converters);

    function getModelConverter(args) {
        return (e, converters) => {
            let name = args.typeName || e.tagName;
            let def = args.definition || enbxModelDefinitions[name];
            return factory.create(e, name, def, converters);
        };
    }
    converters.add('model', getModelConverter);
    
    function createEnbxModel(element, resolveResource){
        if(resolveResource){
            return factory.create(element, undefined, undefined, 
            { 
                getFor: type => {
                    if(type === 'res'){
                        return e => { return resolveResource(e.innerHTML); };
                    }
                    else{
                        return undefined;
                    }
            }});       
         }
        else{
            return factory.create(element);
        }
    }
    exports.createEnbxModel = createEnbxModel;
})();
