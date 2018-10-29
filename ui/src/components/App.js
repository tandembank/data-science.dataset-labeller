import React from 'react'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'
import LoginContainer from '../containers/LoginContainer'
import DatasetsContainer from '../containers/DatasetsContainer'
import DatasetContainer from '../containers/DatasetContainer'
import AddDatasetContainer from '../containers/AddDatasetContainer'
import LabellerContainer from '../containers/LabellerContainer'
import LabellerDetailContainer from '../containers/LabellerDetailContainer'
import logo from '../images/logo.svg'
import '../styles/App.css'


export default class App extends React.Component {
  PrivateRoute = ({ component: Component, ...rest }) => {
    // console.log('this.props.loggedIn: ' + this.props.loggedIn)
    // while (this.props.loggedIn == undefined) {
    //   console.log('waiting')
    // }
    return (
      <Route
        {...rest}
        render={props =>
          this.props.loggedIn ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location }
              }}
            />
          )
        }
      />
    );
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Link to="/"><img src={logo} className="App-logo" alt=" " /></Link>
          <span style={{marginLeft: '40px', color: '#fff'}}>Logged in: {this.props.loggedIn ? 'YES' : 'NO'}</span>

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

          <this.PrivateRoute exact path="/" component={Home} />
          <Route path="/components" component={Components} />
          <Route path="/login" component={Login} />
          <Route path="/label" component={Label} />
          <Route path="/about" component={About} />
          <Route path="/topics" component={Topics} />
        </div>
      </Router>
    )
  }
}


const Home = (params, otherParams) => {
  return (
    <div>
      {/* <img src={spinner} className="App-logo" alt=" " /> */}
      <div className="App-content">
        {/* {content(params)} */}
        <DatasetsContainer />
      </div>
    </div>
  )
}

const Login = () => (
  <div className="App-content">
    <LoginContainer />
  </div>
)

const Label = () => (
  <div className="App-content">
    <LabellerContainer datasetId={1} />
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
      <DatasetContainer name="Fruit" percentComplete={62.5} createdBy="Damian" createdAt="17/10/2018" numDatapoints="5000" numLabels="2" numUserLabels="3" />
      <AddDatasetContainer />
      <AddDatasetContainer started={true} />
      <AddDatasetContainer
        started={true}
        csvUploaded={true}
        name="Fruit"
        fields={[
          {name: 'shape', sample: 'round', selected: false},
          {name: 'color', sample: 'green', selected: true},
          {name: 'texture', sample: 'smooth', selected: false},
        ]}
        labels={[
          {name: 'Apple', shortcut: 'A'},
          {name: 'Orange', shortcut: 'O'},
          {name: 'Pear', shortcut: 'P'},
        ]}
        numLabellingsRequired="3"
        numDatapoints="5000"
      />
      <LabellerDetailContainer
        data={[
          {key: 'shape', value: 'round'},
          {key: 'color', value: 'green'},
          {key: 'texture', value: 'smooth'},
        ]}
        labels={[
          {id: 1, shortcut: 'A', name: 'Apple'},
          {id: 2, shortcut: 'O', name: 'Orange'},
          {id: 3, shortcut: 'P', name: 'Pear'},
        ]} />
    </div>
  </div>
)
