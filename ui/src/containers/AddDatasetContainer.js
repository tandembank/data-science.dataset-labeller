import React from 'react'
import AddDataset from '../components/AddDataset'


export default class AddDatasetContainer extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    return <AddDataset started={this.props.started} csvUploaded={this.props.csvUploaded} data={this.props.data} />
  }
}
