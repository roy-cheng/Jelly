'use strict';

const change = require('./utils').change;

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

    if (action.type.match(/^~file\/open/)) {
        return fileOpen(state, action);
    }
    else {
        switch (action.type) {
            case '~file/listFiles/request':
                return change(state, {
                    isLoadingLocalList: true
                });
            case '~file/listFiles/complete':
                return change(state, {
                    isLoadingLocalList: false,
                    justListLocal: true,
                    localFiles: action.files
                });
            case '~navigation/slide':
                return change(state, {
                    activeIndex: action.index,
                    justNavigatedl: true
                });
        }
    }

    return change(state);
}

function fileOpen(state, action) {
    if (action.type === '~file/open/request') {
        return change(state, {
            goingOpen: true,
            isLoading: true,
            url: action.url
        });
    }
    if (state.url !== action.url) {
        return change(state);
    }

    switch (action.type) {
        case '~file/open/board':
            let slides = new Array(action.board.slides.length);
            return change(state, {
                slides: slides,
                justUpdatedSlideCount: true,
                activeIndex: 0
            });
        case '~file/open/slide':
            state.slides[action.index] = action.slide;
            return change(state, {
                justUpdatedSlideIndex: action.index,
                justLoadedSlide: true
            });
        case '~file/open/complete':
            return change(state, {
                justOpened: true,
                isLoading: false,
                document: action.document
            });
        default:
            return change(state);
    }
}

module.exports = file;