'use strict';

let core = require('./core');
let enbxModelDefinitions = require('./definition');
let converters = new core.ConverterToolkit();
let factory = new core.ModelFactory(enbxModelDefinitions, converters);

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
module.exports = createEnbxModel;