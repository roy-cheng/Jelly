'use strict';

const change = require('./utils').change;

function root(state, action) {
    if (typeof state === 'undefined') {
        state = {
            ready: false,
            view: 'edit'
        };
    }

    switch (action.type) {
        case '~ready':
            return change(state, { ready: true, justReady: true });
        case '~view/edit':
            return change(state, {
                view: 'edit',
                goingToEditView: state.view !== 'edit',
            });
        case '~view/display':
            return change(state, {
                view: 'display',
                goingToDisplayView: state.view !== 'display'
            });
    }
    return state;
}

module.exports = root;