const app = require('./src/reducers');

app.subscribe(() => {
    var state = app.getState();
    if (state.application.justReady) {
        app.thenDispatch({ type: '~file/open/request', url: 'local/a.enbx' });
        app.thenDispatch({ type: '~file/listLocal' });
    }
});

require('./src/view');
require('./src/document');