import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import classNames from "classnames"
import Countdown from 'react-countdown-now';
import { Link } from 'react-router-dom';

import Cursor from './Cursor.js'
import Answer from './Answer.js'
import withLocalSettings from '../utils/withLocalSettings'
import { Votings, VotingSettings } from '../api/votings.js';
import { Cursors } from '../api/cursors.js';

import './VotingContainer.css'


class VotingContainer extends Component {
    constructor() {
        super();
        this.state = {
            width: 0,
            height: 0,
        }
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
        this.isWinningAnswer = this.isWinningAnswer.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
        this.mouseX = 50
        this.mouseY = 50
        this.lastMouseUpdate = 0
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions)
    }

    componentDidUpdate() {
        if (this.props.voting != null) {
            if (this.props.voting.isClosed()) {
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions)
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }


    onMouseMove(event) {

        if (new Date().getTime() - this.lastMouseUpdate > 100) {
            this.lastMouseUpdate = new Date().getTime()
            let x = parseInt(event.clientX / this.state.width * 100)
            let y = parseInt(event.clientY / this.state.height * 100)


            if (!this.isWindowLandscape()) {
                //switch coordinates
                let tempX = x
                x = y
                y = tempX
            }

            Meteor.call('voting.cursors.upsert', this.props.voting._id, this.props.userId, this.props.cursorIcon, x, y);
        }
    }

    // onMouseMove(e) {
    //     this.mouseX = (e.screenX - this.offsetLeft) / this.state.width * 100;
    //     this.mouseY = (e.screenY = this.offsetTop) / this.state.height * 100;

    //     console.log(this.offsetTop)
    // }

    isWindowLandscape() {
        return this.state.width > this.state.height
    }

    isWinningAnswer(index) {
        return this.props.voting.getWinningAnswerIndex() == index
    }

    isDraw() {
        return this.isWinningAnswer(-1)
    }

    getResult() {
        if(this.props.voting.isClosed()) {
            let draw = this.props.voting.getWinningAnswerIndex() == -1;

            if(draw) return " - It's a draw!"
        }

        return ""
    }

    getTitle() {
        let title = this.props.voting.question

        return title
    }



    getSubtitle() {
        if (this.props.voting.isClosed()) {
            return ("Voting closed")
        } else {
            const rendererClosing = ({ hours, minutes, seconds, completed }) => {
                if (completed) {
                    // Render a completed state
                    return "Voting closed";
                }
                else if (parseInt(hours) == 0 && minutes < (VotingSettings.closingDuration / 60)) return (<span className="urgent">Closing in {(minutes * 60 + parseInt(seconds))} seconds</span>)

                else if (parseInt(hours) == 0 && minutes < 60) return (<span>Closing in {parseInt(minutes) + 1} minutes</span>)

                else return ("Open until " + moment(this.props.voting.deadline).calendar())
            }

            return (
                <Countdown
                    renderer={rendererClosing}
                    date={this.props.voting.deadline}
                    zeroPadLength={1}
                    daysInHours={true}
                    onComplete={() => { this.forceUpdate() }}
                />
            )
        }
    }

    render() {
        if (this.props.voting == undefined) return null

        var containerClass = classNames({
            "running": this.props.voting.isRunning(),
            "closed": this.props.voting.isClosed(),
            "closing": this.props.voting.isClosing(),
            "draw": this.isDraw(),
            "voting-container": true,
            'container': true,
            'landscape': this.isWindowLandscape(),
            'portait': !this.isWindowLandscape()
        });

        return (
            <div className={containerClass} onMouseMove={this.onMouseMove}>
                <header className="voting-header">
                    <nav>
                        <Link className="back-link" to="/"><span>✕</span> close</Link>
                    </nav>
                    <div className="voting-title">
                        <h1>{this.getTitle()}</h1>
                        <h2>{this.getSubtitle()}{this.getResult()}</h2>
                    </div>
                    <div className="voting-meta">
                        <span className="user-cursor">{this.props.cursorIcon}</span>
                    </div>
                </header>
                <div className="cursor-container">
                    {this.props.cursors.filter(cursor => cursor.userId != this.props.userId)
                        .map((c, i) =>
                            <Cursor key={c._id} cursor={c} isLandscape={this.isWindowLandscape()} />
                        )}
                </div>
                <div className="answer-list">
                    {this.props.voting.answers.map((a, i) =>
                        <Answer key={i} winning={this.isWinningAnswer(i)} answerText={a} isLandscape={this.isWindowLandscape()} />
                    )}
                </div>
            </div>
        );
    }
}

export default withLocalSettings(withTracker(props => {
    let votingID = props.match.params.id

    Meteor.subscribe("voting", votingID)
    Meteor.subscribe("voting.cursors", votingID, props.userId)


    let voting = Votings.findOne({ _id: votingID })
    // only show cursors which where updated within the last 3 seconds, exclude own cursor
    let cursors = Cursors.find({ updatedAt: { $gte: moment().subtract(VotingSettings.lastCursorChangeDuration, "seconds").toDate() } }).fetch()
    //let cursors = Cursors.find({ }).fetch()

    return {
        voting: voting,
        cursors: cursors
    };
})(VotingContainer));