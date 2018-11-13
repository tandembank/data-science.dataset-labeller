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
      previousDatapoint: null,
      loadedLabels: false,
      loadedDatapoints: false,
    }
    this.NUMPAD_MAPPING = {
      a: '1',
      b: '2',
      c: '3',
      d: '4',
      e: '5',
      f: '6',
      g: '7',
      h: '8',
      i: '9',
      '`': '0',
    }
  }

  componentDidMount = () => {
    this.setState({
      datasetId: this.props.datasetId,
    }, () => {
      this.fetchLabels()
      this.fetchDatapoints()
    })

    document.onkeydown = (e) => this.checkKey(e)
  }

  fetchLabels = async () => {
    try {
      const response = await fetch(`/api/labels/${this.state.datasetId}/`)
      if (response.ok) {
        const responseBody = await response.json()
        this.setState({
          labels: responseBody.labels,
          loadedLabels: true,
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
        let newDatapoints = responseBody.datapoints
        // Ensure the existing datapoint are in the new list
        for (let oldDatapoint of this.state.datapoints) {
          if (newDatapoints.map((item) => {return item.id}).indexOf(oldDatapoint.id) < -1) {
            newDatapoints.splice(0, 0, oldDatapoint)
          }
        }
        this.setState({
          datapoints: newDatapoints,
          currentDatapoint: responseBody.datapoints[0],
          loadedDatapoints: true,
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

  onSelectLabel = async (data) => {
    const datapointId = data.datapointId
    const labelId = data.labelId

    let formData = new FormData()
    formData.append('label_id', labelId)

    try {
      const response = await fetch(`/api/assign-label/${datapointId}/`, {
        method: 'post',
        body: formData,
      })
      if (!response.ok) {
        throw new Error('Post Failed')
      }
    }
    catch(error) {
      console.log('Request failed', error)
      alert('Failed to save')
    }

    let datapoints = this.state.datapoints
    datapoints.splice(0, 1)
    this.setState({
      datapoints: datapoints,
      currentDatapoint: datapoints[0],
      previousDatapoint: this.state.currentDatapoint,
    })
    if (datapoints.length <= 2) {
      this.fetchDatapoints()
    }
  }

  onUndo = () => {
    let datapoints = this.state.datapoints
    this.state.datapoints.splice(0, 0, this.state.previousDatapoint)
    this.setState({
      datapoints: datapoints,
      currentDatapoint: this.state.previousDatapoint,
      previousDatapoint: null,
    })
  }

  checkKey = (e) => {
    e = e || window.event;
    let label = null

    // Undo if backspace is pressed
    if (e.keyCode === 8 && this.state.previousDatapoint) {
      this.onUndo()
    }

    // If only 2 labels then allow left and right arrow keys to be used
    if (this.state.labels.length === 2) {
      if (e.keyCode === 37) {
        label = this.state.labels[0]
      }
      else if (e.keyCode === 39) {
        label = this.state.labels[1]
      }
    }
    // Match keycode to label.shortcut
    if (!label) {
      let key = String.fromCharCode(e.keyCode)
      // Numpad numbers map strangely so have to be converted
      if (key in this.NUMPAD_MAPPING) {
        key = this.NUMPAD_MAPPING[key]
      }
      const labels = this.state.labels.map((label) => {return label.shortcut})
      const matchedIndex = labels.indexOf(key)
      if (matchedIndex > -1) {
        label = this.state.labels[matchedIndex]
      }
    }

    if (label) {
      this.onSelectLabel({
        datapointId: this.state.currentDatapoint.id,
        labelId: label.id,
      })
    }
  }

  render() {
    return <Labeller
      datasetId={this.state.datasetId}
      datapoint={this.state.currentDatapoint}
      labels={this.state.labels}
      onSelectLabel={this.onSelectLabel}
      undoAvailable={this.state.previousDatapoint ? true : false}
      loaded={this.state.loadedLabels && this.state.loadedDatapoints}
      onUndo={() => this.onUndo()}
    />
  }
}
