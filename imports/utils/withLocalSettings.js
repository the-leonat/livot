import React, { Component } from 'react';


export default function withLocalSettings(WrappedComponent) {
  
  return class extends Component {
    constructor(props) {
      super(props)
          
      this.state = {
        userId: undefined
      }

      this.updateUserId = this.updateUserId.bind(this)
    }

    updateUserId() {
        let userId = localStorage.getItem("userId")

        if (userId === undefined || userId === null) {
            userId = Random.id(32);
            //console.log(userId)
            localStorage.setItem("userId", userId)
        }

        this.setState({ userId: userId })
    }

  

    updateCursorIcon() {
      let icon = localStorage.getItem("cursorIcon")

      if (icon === undefined || icon === null) {
          icon = "☝️"
          //console.log(userId)
          localStorage.setItem("cursorIcon", icon)
      }

      this.setState({ cursorIcon: icon })
    }
    
    componentWillMount() {
        this.updateUserId()
        this.updateCursorIcon()
    }
    
    render() {
      return <WrappedComponent userId={this.state.userId} cursorIcon={this.state.cursorIcon} {...this.props} />;
    }
  } 
}