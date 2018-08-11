import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import DateTime from 'react-datetime'

import withLocalSettings from '../utils/withLocalSettings'
import { Votings } from '../api/votings.js';


import './CreateVoting.css'
import './CreateVotingDateTime.css'


// todo

// App component - represents the whole app
class CreateVoting extends Component {
    constructor() {
        super();
        this.state = {
            name: "",
            deadline: moment().add(2, "hours"),
            answers: [{ name: "" }, { name: "" }],
            votingId: "",
            locked: false
        }

        this.handleName = this.handleName.bind(this);
    }

    handleName(event) {
        this.setState({ name: event.target.value })
    }

    handleAnswerNameChange = (idx) => (evt) => {
        if (this.isLocked()) return;

        const newAnswers = this.state.answers.map((answer, sidx) => {
            if (idx !== sidx) return answer;
            return { ...answer, name: evt.target.value };
        });
        this.setState({ answers: newAnswers });
    }

    handleSubmit = (evt) => {
        if (this.isLocked()) return;
        evt.preventDefault();
        this.setState({ locked: true })
        let ret = Meteor.call('votings.insert', this.props.userId, this.state.name, this.state.answers.map((answer) => answer.name), this.state.deadline.toDate(), (error, result) => {
            this.setState({ votingId: result })
            console.log(result)
        })
    }

    handleAddAnswer = (idx) => (evt) => {
        if (this.isLocked()) return;
        if (evt.keyCode == 13 && this.state.answers.length < 8) {
            this.setState({
                answers: this.state.answers.concat([{ name: '' }])
            });
        }
        else if (evt.keyCode == 8 && this.state.answers[idx].name.length == 0) {
            this.removeAnswer(idx)
        }
        //console.log(evt.keyCode, idx)
    }

    removeAnswer = (idx) => {
        if (this.isLocked()) return;
        if (this.state.answers.length <= 2) return;
        this.setState({
            answers: this.state.answers.filter((s, sidx) => idx !== sidx)
        });
    }

    isLocked() {
        return this.state.locked;
    }

    isDone() {
        return this.state.votingId != "" && this.state.locked
    }

    handleDeadlineChange = (date) => {
        this.setState({ deadline: date })
    }

    validateDeadline = (date) => {
        return date.isAfter(moment().subtract(1, "day"))
    }

    validateInputs = () => {
        return this.state.name != "" &&
            this.state.answers.filter((a) => a.name == "").length == 0
    }

    render() {
        return (
            <div className="container create-container landscape">
                <header className="voting-header">
                    <nav>
                        <Link className="back-link" to="/"><span>✕</span> close</Link>
                    </nav>
                    <div className="voting-title">
                        <h2>Create a Voting</h2>
                    </div>
                    <div className="voting-meta">
                        <span className="user-cursor">{this.props.cursorIcon}</span>
                    </div>
                </header>

                <div>
                    <div className="create-voting-form">

                        You asked your self: <br />
                        <input readOnly={this.isLocked()} type="text" placeholder="What would be worth asking?" value={this.state.name} onChange={this.handleName}></input><br />
                        and you already had some answers in mind:<br />
                        {this.state.answers.map((answer, idx) => (
                            <span key={idx}>
                                <span className="answer-numerator">{idx + 1}. </span>
                                <input
                                    className="answer-input"
                                    type="text"
                                    placeholder={`${idx == 0 ? "which were carefully thought" : ""}${idx == 1 ? "and without ambiguity" : ""}`}
                                    value={answer.name}
                                    onChange={this.handleAnswerNameChange(idx)}
                                    onKeyDown={this.handleAddAnswer(idx)}
                                    autoFocus={idx == this.state.answers.length - 1}
                                    readOnly={this.isLocked()}
                                /><br />
                            </span>
                        ))}<br />

                        You knew the voting should happen soon.<br />
                        So you chose a deadline: <br />
                        <DateTime
                            value={this.state.deadline}
                            onChange={this.handleDeadlineChange}
                            dateFormat="DD/MM/YY"
                            timeFormat="HH:mm"
                            isValidDate={this.validateDeadline}
                            open={false}
                            inputProps={{ disabled: this.isLocked() }}
                        />
                        {(!this.isLocked() && this.validateInputs()) &&
                            <span>and <b><a href="create" onClick={this.handleSubmit}> submitted the request.</a></b></span>
                        }
                        {this.isLocked() &&
                            <span>
                                <i> submitted the request</i> and waited...
                            <br />
                            </span>
                        }
                        {this.isDone() &&
                            <span>
                                <br />
                                ... until you recieved a <b><Link to={"/vote/" + this.state.votingId}>precious link</Link></b>,<br />
                                you would later share with your people.<br />
                            </span>
                        }



                    </div>
                </div>
            </div>
        );
    }
}

export default withLocalSettings(withTracker((props) => {
    Meteor.subscribe("votings", props.userId)
    return {
        votings: Votings.find({}).fetch(),
    };
})(CreateVoting));