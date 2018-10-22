import React from 'react'
import '../styles/Login.css'


const Login = params => (
  <div className="Login">
    <form>
      <ul>
        <li>
          <label>Username</label><input type="text" onChange={(e) => params.onChange('username', e.target.value)} ref={params.usernameFieldRef}></input>
        </li>
        <li>
          <label>Password</label><input type="password" onChange={(e) => params.onChange('password', e.target.value)}></input>
        </li>
        <li className="Submit">
          <button onClick={(e) => params.onSubmit(e)}>Submit</button>
        </li>
      </ul>
    </form>
  </div>
)

export default Login
