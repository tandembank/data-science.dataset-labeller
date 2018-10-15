import React from "react"
import App from "../components/App"


export default class AppContainer extends React.Component {
  constructor() {
    super()
    this.state = { loggedIn: null }
  }
  
  componentDidMount() {
    this.setLoggedInState()
  }

  setLoggedInState() {
    fetch('/api/logged-in/', {'redirect': 'manual'})
    .then((data) => {
      if (data.status === 200) {
        this.setState({'loggedIn': true})
      }
      else {
        this.setState({'loggedIn': false})
      }
    })
  }
  
  render() {
    return <App loggedIn={this.state.loggedIn} onLoggedIn={() => this.setLoggedInState()} />
  }
}