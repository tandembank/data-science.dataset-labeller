import React from 'react'
import Login from '../components/Login'
import Spinner from '../components/Spinner'


export default class LoginContainer extends React.Component {
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
  }

  componentDidMount() {
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

    setTimeout(() => {
      fetch('/accounts/login/', {
        method: 'post',
        redirect: 'manual',
        body: formData,
      })
      .then((response) => {
        if (response.status === 0) {
          this.props.onLoggedIn()
        }
        else {
          throw new Error('Login Failed')
        }
      })
      .catch((error) => {
        console.log(error)
        this.setState({ready: true})
      })
    }, 500)
  }
  
  render() {
    if (this.state.ready) {
      return <Login errors={this.state.errors} onChange={(key, val) => this.onChange(key, val)} onSubmit={(e) => this.onSubmit(e)} />
    }
    else {
      return <Spinner />
    }
  }
}
