import React, { Component } from 'react';
import ReactCursorPosition from 'react-cursor-position';
import VotingContainer from './VotingContainer.js'


// App component - represents the whole app
export default class VotingView extends Component {
    render() {
        return (
        <ReactCursorPosition>
            <VotingContainer {...this.props} />
        </ReactCursorPosition>   
        ) 
    }
}