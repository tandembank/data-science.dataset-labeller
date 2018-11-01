import React from 'react'
import { withRouter } from "react-router-dom";
import Login from '../components/Login'


class LoginContainer extends React.Component {
  constructor() {
    super()
    this.state = {
      errors: [],
      ready: true,
      csrftoken: '',
      data: {
        username: '',
        password: '',
      }
    }
    this.usernameFieldRef = React.createRef()
  }

  componentDidMount() {
    this.usernameFieldRef.current.focus()

    fetch('/api/csrf-token/')
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      else {
        throw new Error('Post Failed')
      }
    })
    .then((responseBody) => {
      this.setState({csrftoken: responseBody.csrftoken})
    })
    .catch((error) => {
      console.log('Request failed', error)
    })
  }

  onChange(key, val) {
    let data = this.state.data
    data[key] = val
    this.setState({data: data})
  }

  onSubmit(e) {
    e.preventDefault()
    this.setState({ready: false})

    let formData = new FormData()
    formData.append('username', this.state.data.username)
    formData.append('password', this.state.data.password)
    formData.append('csrfmiddlewaretoken', this.state.csrftoken)

    fetch('/accounts/login/', {
      method: 'post',
      redirect: 'manual',
      body: formData,
    })
    .then((response) => {
      if (response.status === 0) {
        this.props.onLoggedIn()
        setTimeout(() => {
          this.props.history.push('/')
        }, 500)
      }
      else {
        throw new Error('Login Failed')
      }
    })
    .catch((error) => {
      console.log(error)
      this.setState({ready: true})
    })
  }
  
  render() {
      return <Login loading={!this.state.ready} errors={this.state.errors} onChange={(key, val) => this.onChange(key, val)} onSubmit={(e) => this.onSubmit(e)} usernameFieldRef={this.usernameFieldRef} />
  }
}

export default withRouter(LoginContainer);