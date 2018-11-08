import React from 'react'
import Datasets from '../components/Datasets'


export default class DatasetsContainer extends React.Component {
  constructor() {
    super()
    this.state = {
        loading: true,
        datasets: [],
        datasetEditing: this.props ? this.props.datasetEditing : null,
    }
  }

  componentDidMount() {
    this.fetchDatasets()
  }

  fetchDatasets = async () => {
    try {
      const response = await fetch('/api/datasets/')
      if (response.ok) {
        const responseBody = await response.json()
        let datasets = responseBody.datasets.map((dataset) => {
          return {
            id: dataset.id,
            name: dataset.name,
            percentComplete: dataset.labelling_complete * 100,
            createdBy: dataset.created_by,
            createdAt: dataset.created_at,
            numDatapoints: dataset.num_datapoints,
            fields: dataset.fields,
            labels: dataset.labels,
            multipleLabels: dataset.multiple_labels,
            numLabellingsRequired: dataset.num_labellings_required,
            numTotalLabellingsRequired: dataset.num_total_labellings_required,
            numLabellingsCompleted: dataset.num_labellings_completed,
          }
        })
        this.setState({datasets: datasets, loading: false})
      }
      else {
        throw new Error('Request Failed')
      }
    }
    catch(error) {
      console.log('Request failed', error)
    }
  }

  onEdit = (id) => {
    this.setState({datasetEditing: id})
    if (!id) {
      this.fetchDatasets()
    }
  }
  
  render() {
    return <Datasets
      loading={this.state.loading}
      datasets={this.state.datasets}
      datasetEditing={this.state.datasetEditing}
      onEdit={this.onEdit} />
  }
}
