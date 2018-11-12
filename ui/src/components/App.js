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
    return (
      <Route
        {...rest}
        render={props => {
          if (this.props.loggedIn) {
            return <Component {...props} />
          }
          else if (this.props.loggedIn === false) {
            return <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location }
              }}
            />
          }
          return null
        }}
      />
    )
  }

  render() {
    return (
      <Router>
        <div className="App">
          <div><Link to="/"><img src={logo} className="App-logo" alt=" " /></Link></div>
          {/* <span style={{marginLeft: '40px', color: '#fff'}}>Logged in: {this.props.loggedIn ? 'YES' : 'NO'}</span> */}

          <this.PrivateRoute exact path="/" component={Home} />
          <Route path="/components" component={Components} />
          <Route path="/login" render={(props) => <Login onLoggedIn={this.props.onLoggedIn} />} />
          <Route path="/label/:id" component={Label} />
        </div>
      </Router>
    )
  }
}


const Home = (params, otherParams) => {
  return (
    <div>
      <div className="App-content">
        <DatasetsContainer />
      </div>
    </div>
  )
}

const Login = (params) => (
  <div className="App-content">
    <LoginContainer onLoggedIn={params.onLoggedIn} />
  </div>
)

const Label = ({match}) => {
  return (
    <div className="App-content">
      <LabellerContainer datasetId={match.params.id} />
    </div>
  )
}
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
