import React from 'react'
import App from '../components/App'


export default class AppContainer extends React.Component {
  constructor() {
    super()
    this.state = { loggedIn: null }
  }
  
  componentDidMount() {
    this.setLoggedInState()
  }

  setLoggedInState = async () => {
    try {
      const response = await fetch('/api/logged-in/', {'redirect': 'manual'})
      if (response.status === 200) {
        this.setState({'loggedIn': true})
      }
      else {
        this.setState({'loggedIn': false})
      }
    }
    catch(error) {
      console.log('Request failed', error)
    }
  }
  
  render() {
    return <App loggedIn={this.state.loggedIn} onLoggedIn={() => this.setLoggedInState()} />
  }
}