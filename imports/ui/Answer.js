import React, { Component } from 'react';
import './Answer.css'
import classNames from "classnames"


export default class Answer extends Component {
    constructor(props) {
        super(props)
        this.state = { clicked: false }
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(isDown, e) {
        this.setState( { clicked: isDown } )
    }

    render() {
        //let transform = this.props.isLandscape ? {transform: "translate3d(" + this.props.cursor.x + "vw," +  this.props.cursor.y + "vh, 0)"} : {transform: "translate3d(" + this.props.cursor.y + "vw," +  this.props.cursor.x + "vh, 0)"}
        var answerClass = classNames({
            'answer': true,
            'winning': this.props.winning,
            'clicked': this.state.clicked
        });
        return (
            <div className={answerClass} onMouseDown={(e) => this.handleClick(true, e)} onMouseUp={(e) => this.handleClick(false, e)}>
                <h3>
                    {this.props.answerText}
                </h3>
            </div>
        );
    }
}
