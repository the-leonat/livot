import React, { Component } from 'react';
import VotingContainer from './VotingContainer.js'

// App component - represents the whole app
export default class VotingView extends Component {
    render() {
        return (
            <VotingContainer {...this.props} />

        )
    }
}