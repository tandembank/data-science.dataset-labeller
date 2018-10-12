import React from "react";
import './Login.css';


const Login = errors => (
  <div className="Login">
    <ul>
      <li>
        <label>Username</label><input type="text"></input>
      </li>
      <li>
        <label>Password</label><input type="password"></input>
      </li>
      <li className="Submit">
        <input type="submit" />
      </li>
    </ul>
  </div>
)

export default Login