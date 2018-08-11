import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Countdown from 'react-countdown-now';


export default class VotingListItem extends Component {
  getClosingTime() {
    if (this.props.voting.isClosed()) {
      return ("Closed")
    } else {
      const rendererClosing = ({ hours, minutes, seconds, completed }) => {

        if (completed) {
          // Render a completed state
          return "Closed";
        }

        else if (hours == 0 && minutes < 60) return "Closing soon"

        else return (moment(this.props.voting.deadline).calendar())
      }

      return (
        <Countdown
          renderer={rendererClosing}
          date={this.props.voting.deadline}
          zeroPadLength={1}
          onComplete={() => { this.forceUpdate() }}
          daysInHours={true}
        />
      )
    }
  }

  render() {
    return (

      <li>
        <Link to={`/vote/${this.props.voting._id}`}>{this.props.voting.question}</Link>
        <span className="voting-meta">
            {this.getClosingTime()}
        </span>
      </li>
    );
  }
}