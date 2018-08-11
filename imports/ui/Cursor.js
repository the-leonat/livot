import React, { Component } from 'react';
import withLocalSettings from '../utils/withLocalSettings'

import './Cursor.css'

class Cursor extends Component {

    render() {
        let transform = this.props.isLandscape ? {transform: "translate3d(" + this.props.cursor.x + "vw," +  this.props.cursor.y + "vh, 0)"} : {transform: "translate3d(" + this.props.cursor.y + "vw," +  this.props.cursor.x + "vh, 0)"}

        return (
            <div 
                className="cursor" 
                style={transform}
            >{this.props.cursor.icon}</div>
        );
    }
}

export default withLocalSettings(Cursor)
