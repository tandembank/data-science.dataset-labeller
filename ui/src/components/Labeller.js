import React from 'react'
import LabellerDetailContainer from '../containers/LabellerDetailContainer'
import Spinner from '../components/Spinner'
import '../styles/Labeller.css'


export default class Labeller extends React.Component {
  render() {
    if (!this.props.loaded) {
      return (
        <div className="loading">
          <Spinner />
        </div>
      )
    }
    else if (this.props.datapoint && this.props.labels) {
      return <LabellerDetailContainer
        datapointId={this.props.datapoint.id}
        data={this.props.datapoint.data}
        labels={this.props.labels}
        onSelectLabel={this.props.onSelectLabel}
        undoAvailable={this.props.undoAvailable}
        onUndo={this.props.onUndo}
        />
    }
    else {
      return (
        <div className="noItems">
          <h1>No more items to label</h1>
          <img src="https://media.giphy.com/media/5PSPV1ucLX31u/giphy.gif"/>
        </div>
      )
    }
  }
}
