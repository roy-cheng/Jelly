const React = require('react');

module.exports = React.createClass({
    render: function() {
        return <ul>
            {
                this.props.files.map(file => {
                    return <li key={file.path} onClick={ e=>{
                        this.props.onItemClick(file.path);
                    }}>{file.name}</li>
                })
            }
        </ul>;
    }
});
