import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Random } from 'meteor/random'
import { check } from 'meteor/check'
import { Votings } from '../api/votings.js';
import { Cursors } from '../api/cursors.js';
import {withRouter} from 'react-router-dom';
import Cursor from './Cursor.js'
import Answer from './Answer.js'
import classNames from "classnames"

import ReactCursorPosition from 'react-cursor-position';
import withLocalSettings from '../utils/withLocalSettings'
import './VotingContainer.css'


// App component - represents the whole app
class VotingContainer extends Component {
    constructor() {
        super();
        this.state = { 
            width: 0, 
            height: 0,
        }
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
        this.isWinningAnswer = this.isWinningAnswer.bind(this)
        // this.onMouseMove = this.onMouseMove.bind(this)
        this.timer = this.timer.bind(this)
        this.updateUserCursor = this.updateUserCursor.bind(this)
        this.mouseX = 50
        this.mouseY = 50
    }
    
    componentDidMount() {
        this.countdown = setInterval(this.timer, 50);
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions)

    }
    
    componentWillUnmount() {
        clearInterval(this.countdown);
        window.removeEventListener("resize", this.updateWindowDimensions)
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    updateUserCursor() {
        //normalize
        let x = this.props.position.x / this.state.width * 100
        let y = this.props.position.y / this.state.height * 100

        if(!this.isWindowLandscape()) {
            //switch coordinates
            let tempX = x
            x = y
            y = tempX
        }

        Meteor.call('voting.cursors.upsert', this.props.voting._id, this.props.userId, x, y);
    }

    timer() {
        if(this.props.isActive) {
            this.updateUserCursor();
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

    render() {
        if(this.props.voting == undefined) return null

        var containerClass = classNames({
            'container': true,
            'landscape': this.isWindowLandscape(),
            'portait': !this.isWindowLandscape()
        });

        return (
            <div className={containerClass}>
                <div className="answer-list">
                    {this.props.voting.answers.map((a,i) =>
                        <Answer key={i} winning={this.isWinningAnswer(i)} answerText={a} isLandscape={this.isWindowLandscape()} />
                    )}
                </div>
                <header>
                <h1>{this.props.voting.question}</h1>
                </header>
                <div className="cursor-container">
                    {this.props.cursors.map((c,i) =>
                        <Cursor key={c._id} cursor={c} isLandscape={this.isWindowLandscape()} />
                    )}
                </div>
            </div>
        );
    }
}

export default withLocalSettings(withTracker(props => {
    let votingID = props.match.params.id

    Meteor.subscribe("votings")
    Meteor.subscribe("voting.cursors", votingID, props.userId)


    let voting = Votings.findOne({_id: new Mongo.ObjectID(votingID)})
    // only show cursors which where updated within the last 3 seconds, exclude own cursor
    let cursors = Cursors.find({ userId: { $nin: [props.userId] }, updatedAt: { $gte: new Date(Date.now() - 1000 * 3) } }).fetch()

    return {
        voting: voting,
        cursors: cursors,
    };
})(VotingContainer));