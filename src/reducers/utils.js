'use strict';

function change(state, properties) {
    return Object.assign({}, state, properties);
}

exports.change = change;