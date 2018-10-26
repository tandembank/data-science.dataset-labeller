import React from 'react'
import Labeller from '../components/Labeller'


export default class LabellerContainer extends React.Component {
  constructor() {
    super()
    this.state = {
      datasetId: this.props ? this.props.datasetId : null,
      datapoints: [],
    }
  }

  componentDidMount() {
    this.fetchDatapoints()
  }

  fetchDatapoints = async () => {
    try {
      const response = await fetch(`/api/datapoints/${this.state.datasetId}/`)
      if (response.ok) {
        const responseBody = await response.json()
        console.log(responseBody)
        this.setState({datapoints: responseBody.datapoints})
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
    return <Labeller datasetId={this.props.datasetId} />
  }
}
