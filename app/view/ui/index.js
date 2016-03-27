const React = require('react');
const ReactDom = require('react-dom');
const { connect } = require('react-redux');

const FileList = require('./FileList');

// FileList = connect(
//     state => { return { files: state.file.localFiles }; },
//     dispatch => { return { onItemClick: id => dipatch(actions.open(id)) }; }
// )(FileList);

exports.renderFileList = files => {
    ReactDom.render(
        React.createElement(FileList, {files: files, onItemClick:  path => {
            app.dispatch(actions.open(path)); 
            $('#file-list-panel').hide();
        }}),
        document.getElementById('file-list-panel')
    );
}  