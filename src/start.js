'use strict';

if (!$) {
    var $ = require('jquery');
}

var app = null;
(function() {
    let redux = require('redux');
    let createStore = redux.createStore;
    let combineReducers = redux.combineReducers;

    function change(state, obj) {
        return Object.assign({}, state, obj);
    }

    function application(state, action) {
        if (typeof state === 'undefined') {
            state = {
                ready: false,
                view: 'edit'
            };
        }

        for (var field in state) {
            if (field.match(/^going/) || field.match(/^just/)) {
                delete state[field];
            }
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

    function file(state, action) {
        if (typeof state === 'undefined') {
            state = {
                localRepository: '../src/document',
                document: null,
                isLoading: false
            };
        }

        for (var field in state) {
            if (field.match(/^going/) || field.match(/^just/)) {
                delete state[field];
            }
        }

        switch (action.type) {
            case '~file/open':
                if (state.url !== action.url) {
                    return change(state, {
                        goingOpen: true,
                        isLoading: true,
                        url: action.url
                    });
                }
                break;
            case '~file/didOpen':
                if (state.url === action.url) {
                    return change(state, {
                        justOpened: true,
                        isLoading: false,
                        document: action.document
                    });
                }
                break;
            case '~file/listLocal':
                return change(state, {
                    isLoadingLocalList: true,
                    goingListLocal: true,
                });
            case '~file/didListLocal':
                return change(state, {
                    isLoadingLocalList: false,
                    justListLocal: true,
                    localFiles: action.localFiles
                });
        }
        return state;
    }

    const reducers = combineReducers({ application, file });
    const router = (state, action) => {
        console.log(action.type)
        return reducers(state, action);
    };

    app = createStore(router);
    app.thenDispatch = action => {
        setTimeout(() => { app.dispatch(action) }, 0);
    }

})();

app.subscribe(() => {
    var state = app.getState();
    if (state.application.justReady) {
        app.thenDispatch({ type: '~file/open', url: '.test/test.enbx' });
        app.thenDispatch({ type: '~file/listLocal' });
    }
});

require('../src/view');
require('../src/document');