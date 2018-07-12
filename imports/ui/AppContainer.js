import React, { Component } from 'react';
import VotingListItem from './VotingListItem.js';
import { withTracker } from 'meteor/react-meteor-data';
import { Votings } from '../api/votings.js';

// todo

// App component - represents the whole app
class AppContainer extends Component {

    renderVotingsListItems() {
        return this.props.votings.map((voting) => (
            <VotingListItem key={voting._id} voting={voting} />
        ));
    }

    render() {
        return (
            <div className="container">
                <header>
                <h1>Livot</h1>
                </header>

                <ul>
                {this.renderVotingsListItems()}
                </ul>
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe("votings")
    return {
        votings: Votings.find({}).fetch(),
    };
})(AppContainer);