import React from 'react'
import Dataset from '../components/Dataset'


export default class DatasetContainer extends React.Component {
  constructor() {
    super()
    this.state = {}
  }
  
  render() {
    return <Dataset percentComplete={this.props.percentComplete} name={this.props.name} createdBy={this.props.createdBy} createdAt={this.props.createdAt} numDatapoints={this.props.numDatapoints} numLabels={this.props.numLabels} numUserLabels={this.props.numUserLabels} />
  }
}
