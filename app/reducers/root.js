'use strict';

const change = require('./utils').change;

function root(state, action) {
    if (typeof state === 'undefined') {
        state = {
            ready: false
        };
    }

    switch (action.type) {
        case '~ready':
            return change(state, { ready: true, justReady: true });
    }
    return state;
}

module.exports = root;