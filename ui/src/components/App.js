import React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import LoginContainer from '../containers/LoginContainer'
import Dataset from '../components/Dataset'
import AddDataset from '../components/AddDataset'
import Labeller from '../components/Labeller'
import spinner from '../images/spinner.svg'
import logo from '../images/logo.svg'
import '../styles/App.css'


function content(params) {
  if (params.loggedIn == null) {
    return <img src={spinner} className="App-logo" alt=" " />
  }
  else if (!params.loggedIn) {
    return <LoginContainer onLoggedIn={params.onLoggedIn} />
  }
  else {
    return (
      <div>
        <Dataset percentComplete={66.6} name="Fruit" createdBy="Damian" createdAt="17/10/2018" numDatapoints="5000" numLabels="2" numUserLabels="3" />
        <AddDataset />
        <AddDataset started={true} />
        <AddDataset started={true} csvUploaded={true} />
        <Labeller />
      </div>
    )
  }
}

const App = (params) => (
  <Router>
    <div className="App">
      <img src={logo} className="App-logo" alt=" " />

      <div className="App-content">
        {content(params)}
      </div>

      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/topics">Topics</Link>
        </li>
      </ul>

      <hr />

      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/topics" component={Topics} />
    </div>
  </Router>
)

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

const About = () => (
  <div>
    <h2>About</h2>
  </div>
)

const Topics = ({ match }) => (
  <div>
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`${match.url}/rendering`}>Rendering with React</Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>Components</Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>Props v. State</Link>
      </li>
    </ul>

    <Route path={`${match.path}/:topicId`} component={Topic} />
    <Route
      exact
      path={match.path}
      render={() => <h3>Please select a topic.</h3>}
    />
  </div>
)

const Topic = ({ match }) => (
  <div>
    <h3>{match.params.topicId}</h3>
  </div>
)

export default App
