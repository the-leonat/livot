import React, { Component } from 'react';
import { Link } from 'react-router-dom';

 
export default class VotingListItem extends Component {
  render() {
    return (
      
      <li><Link to={`/vote/${this.props.voting._id}`}>{this.props.voting.question}</Link></li>
    );
  }
}