
'use strict';

function formatName(name) {
    return name.slice(0, 1).toLowerCase() + name.slice(1);
}
class Model {
    constructor(typeName) {
        this._type = formatName(typeName);
    }
    get type() {
        return this._type;
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
            let fieldName = formatName(childElement.tagName);
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
function arrayToken(type) {
    return { type: 'array', arguments: type };
}
function modelToken(typeName, definition) {
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

exports.ModelFactory = ModelFactory;
exports.ConverterToolkit = ConverterToolkit;
exports.types = std;