import React, { Component } from 'react';
import VotingListItem from './VotingListItem.js';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';

import withLocalSettings from '../utils/withLocalSettings'
import { Votings } from '../api/votings.js';

import './AppContainer.css'

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
            <div className="container list-container landscape">
                <div>
                    <header>
                        <h2>livot</h2>
                    </header>
                    <h2>Settings</h2>
                    <p>
                        Fellow voters call you by the name of _______ and you will soon be recognized by the mighty _.
                    </p>

                    <h2>Votings</h2>
                    <ul className="voting-list">
                        {this.renderVotingsListItems()}
                        <li>
                            <Link to="/new">+ new</Link>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

export default withLocalSettings(withTracker(props => {
    Meteor.subscribe("votings", props.userId)
    return {
        votings: Votings.find({}).fetch(),
    };
})(AppContainer));