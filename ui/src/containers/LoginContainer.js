import React from "react";
import Login from "../components/Login";


export default class LoginContainer extends React.Component {
  constructor() {
    super();
    this.state = { errors: [] }
  }
  
  render() {
    return <Login errors={this.state.errors} />;
  }
}