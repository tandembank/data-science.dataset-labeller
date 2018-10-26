import React from 'react'
import Labeller from '../components/Labeller'


export default class LabellerContainer extends React.Component {
  constructor() {
    super()
    this.state = {
      datasetId: this.props ? this.props.datasetId : null,
      labels: [],
      datapoints: [],
      currentDatapoint: null,
    }
  }

  componentDidMount = () => {
    this.setState({
      datasetId: this.props.datasetId,
    }, () => {
      this.fetchLabels()
      this.fetchDatapoints()
    })
  }

  fetchLabels = async () => {
    try {
      const response = await fetch(`/api/labels/${this.state.datasetId}/`)
      if (response.ok) {
        const responseBody = await response.json()
        this.setState({
          labels: responseBody.labels,
        })
      }
      else {
        throw new Error('Post Failed')
      }
    }
    catch(error) {
      console.log('Request failed', error)
    }
  }

  fetchDatapoints = async () => {
    try {
      const response = await fetch(`/api/datapoints/${this.state.datasetId}/`)
      if (response.ok) {
        const responseBody = await response.json()
        this.setState({
          datapoints: responseBody.datapoints,
          currentDatapoint: responseBody.datapoints[0],
        })
      }
      else {
        throw new Error('Post Failed')
      }
    }
    catch(error) {
      console.log('Request failed', error)
    }
  }

  render() {
    if (this.state.currentDatapoint && this.state.labels) {
      return <Labeller datasetId={this.state.datasetId} datapoint={this.state.currentDatapoint} labels={this.state.labels} />
    }
    return <span></span>
  }
}
