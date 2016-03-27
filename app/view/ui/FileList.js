const React = require('react');

module.exports = React.createClass({displayName: "exports",
    render: function() {
        return React.createElement("ul", null, 
            
                this.props.files.map(file => {
                    return React.createElement("li", {key: file.path, onClick:  e=>{
                        console.error(e);
                        this.props.onItemClick(file.path);
                    }}, file.name)
                })
            
        );
    }
});
