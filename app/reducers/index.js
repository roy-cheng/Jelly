'use strict';

const redux = require('redux');

const root = require('./root');
const file = require('./file');
const navigation = require('./navigation');

const parts = redux.combineReducers({ application: root, file, navigation });


const reducers = (state, action) => {
    console.log(action.type);
    clearTempState(state);
    return parts(state, action);
}

const store = redux.createStore(reducers);

store.thenDispatch = action => {
    setTimeout(() => { store.dispatch(action) }, 0);
}

function clearTempState(state) {
    if (typeof state !== 'object') {
        return;
    }
    for (var field in state) {
        if (field.match(/^going/) || field.match(/^just/)) {
            delete state[field];
        }
        else if (typeof state[field] === 'object') {
            clearTempState(state[field]);
        }
    }
}

module.exports = store;