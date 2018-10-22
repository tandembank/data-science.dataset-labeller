import React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import LoginContainer from '../containers/LoginContainer'
import DatasetContainer from '../containers/DatasetContainer'
import AddDatasetContainer from '../containers/AddDatasetContainer'
import LabellerContainer from '../containers/LabellerContainer'
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
        <DatasetContainer percentComplete={66.6} name="Fruit" createdBy="Damian" createdAt="17/10/2018" numDatapoints="5000" numLabels="2" numUserLabels="3" />
        <AddDatasetContainer />
        <AddDatasetContainer started={true} />
        <AddDatasetContainer started={true} csvUploaded={true} />
        <LabellerContainer />
      </div>
    )
  }
}

const App = (params) => (
  <Router>
    <div className="App">
      <img src={logo} className="App-logo" alt=" " />

      {/* <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/topics">Topics</Link>
        </li>
      </ul> */}

      <Route exact path="/" component={Home} />
      <Route path="/components" component={Components} />
      <Route path="/about" component={About} />
      <Route path="/topics" component={Topics} />
    </div>
  </Router>
)

const Home = (params) => (
  <div>
    <h2>Home</h2>
    <img src={spinner} className="App-logo" alt=" " />
    <div className="App-content">
      {content(params)}
    </div>
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

const Components = ({ match }) => (
  <div className="App-content">
    <div>
      <DatasetContainer percentComplete={66.6} name="Fruit" createdBy="Damian" createdAt="17/10/2018" numDatapoints="5000" numLabels="2" numUserLabels="3" />
      <AddDatasetContainer />
      <AddDatasetContainer started={true} />
      <AddDatasetContainer started={true} csvUploaded={true} data={[
        {name: 'message_id', sample: '252956', selected: false, shortcut: null},
        {name: 'date', sample: '2018-10-22', selected: true, shortcut: 'D'},
        {name: 'conversation', sample: '<p>Hi, I have a question about my card.</p>', selected: false, shortcut: null},
      ]} />
      <LabellerContainer
        data={[
          {key: 'shape', value: 'round'},
          {key: 'color', value: 'green'},
          {key: 'texture', value: 'smooth'},
        ]}
        labels={[
          {id: 1, key: '1', name: 'Apple'},
          {id: 2, key: '2', name: 'Orange'},
          {id: 3, key: '3', name: 'Pear'},
        ]} />
    </div>
  </div>
)

export default App
