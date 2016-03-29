
'use strict';

function formatName(name) {
  return name.slice(0, 1).toLowerCase() + name.slice(1);
}
function getChildElements(element) {
  if (typeof element.children !== 'undefined') {
    return element.children;
  }
  var children = [];
  for (var i = 0; i < element.childNodes.length; i++) {
    var a = element.childNodes[i].nodeType;
    if (element.childNodes[i].nodeType === 1) {
      children.push(element.childNodes[i]);
    }
  }
  return children;
}
function getInnerHTML(element) {
  if (typeof element.innerHTML !== 'undefined') {
    return element.innerHTML;
  }
  for (var i = 0; i < element.childNodes.length; i++) {
    if (element.childNodes[i].nodeType === 3) {
      return element.childNodes[i].nodeValue;
    }
  }
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
      return;
    }
    typeName = typeName || xmlElement.tagName;
    definition = definition || this.definitions[typeName];
    if (!definition) {
      console.warn('undefined type: ' + typeName);
      return;
    }
    let model = new Model(typeName);
    let children = getChildElements(xmlElement);
    for (let i = 0; i < children.length; i++) {
      let childElement = children[i];
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
          let value = converter(childElement, converters);
          if (typeof value !== 'undefined') {
            model[fieldName] = value;
          }
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
      return Array.prototype.slice.call(getChildElements(e)).map(x => conv(x, converters)).
        filter(x => typeof x !== 'undefined');
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
      int: e => parseInt(getInnerHTML(e)),
      float: e => parseFloat(getInnerHTML(e)),
      boolean: e => getInnerHTML(e).toLowerCase() == 'true',
      string: e => getInnerHTML(e)
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
exports.getInnerHTML = getInnerHTML;