'use strict';

let utils = require('./utils');
let defs = require('./definitions');
let converters = new utils.ConverterToolkit();
let factory = new utils.ModelFactory(defs, converters);

function getModelConverter(args) {
  return (e, converters) => {
    let name = args.typeName || e.tagName;
    let def = args.definition || defs[name];
    return factory.create(e, name, def, converters);
  };
}
converters.add('model', getModelConverter);

function createEnbxModel(element, resolveResource) {
  if (resolveResource) {
    return factory.create(element, undefined, undefined, {
      getFor: type => {
        if (type === 'res') {
          return e => {
            return resolveResource(utils.getInnerHTML(e));
          };
        } else {
          return undefined;
        }
      }
    });
  } else {
    return factory.create(element);
  }
}
module.exports = createEnbxModel;