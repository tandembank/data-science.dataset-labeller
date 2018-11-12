import React from 'react'
import AddDataset from '../components/AddDataset'

let lastLabelId = 0

export default class AddDatasetContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      csrftoken:    '',
      started:      props.started,
      csvUploaded:  props.csvUploaded,
      saving:       props.saving,

      id:                     props.id,
      name:                   props.name,
      fields:                 props.fields,
      labels:                 this.ensureLabelIds(props.labels),
      numLabellingsRequired:  props.numLabellingsRequired,
      multipleLabels:         props.multipleLabels | false,

      numDatapoints:  props.numDatapoints,
      uploading:      false,
      uploadError:    null,
      tempPath:       null,
    }
  }

  componentDidMount() {
    this.fetchCsrfToken()
  }

  fetchCsrfToken = async () => {
    try {
      const response = await fetch('/api/csrf-token/')
      if (response.ok) {
        const responseBody = await response.json()
        this.setState({csrftoken: responseBody.csrftoken})
      }
      else {
        throw new Error('Request Failed')
      }
    }
    catch(error) {
      console.log('Request failed', error)
    }
  }

  reset = () => {
    this.setState({
      csrftoken:    '',
      started:      false,
      csvUploaded:  false,
      saving:       false,

      name:                   null,
      fields:                 [],
      labels:                 [],
      numLabellingsRequired:  null,
      multipleLabels:         false,

      numDatapoints:  null,
      uploading:      false,
      uploadError:    null,
      tempPath:       null,
    })
    this.fetchCsrfToken()
  }

  newLabelId = (prefix='id') => {
    lastLabelId++
    return prefix + lastLabelId
  }

  ensureLabelIds = (labels) => {
    if (labels) {
      labels = labels.map((label) => {
        if (!label.id) {
          label.id = this.newLabelId('new_')
        }
        return label
      })
    }
    return labels
  }

  onClose = () => {
    if (this.state.id) {
      this.props.onEdit(null)
    }
    else {
      this.reset()
    }
  }

  onStart = () => {
    this.setState({
      started: true,
      uploading: false,
      csvUploaded: false,
      uploadError: null,
    })
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length === 1 && rejectedFiles.length === 0) {
      this.setState({
        uploading: true,
        uploadError: null,
      })
      this.upload(acceptedFiles[0])
    }
    else {
      this.setState({
        uploadError: 'Unsupported file type — must be a single CSV file.',
      })
    }
  }

  upload = async (file) => {
    let formData = new FormData()
    formData.append('file', file)
    formData.append('csrfmiddlewaretoken', this.state.csrftoken)

    try {
      const response = await fetch('/api/csv-upload/', {
        method: 'post',
        body: formData,
      })
      if (response.ok) {
        const responseBody = await response.json()

        let fields = responseBody.fields.map((item, index) => {
          return {
            name: item,
            sample: responseBody.samples[index],
            selected: false,
            shortcut: null,
          }
        })

        this.setState({
          uploading: false,
          csvUploaded: true,
          fields: fields,
          labels: [],
          numDatapoints: responseBody.num_datapoints,
          tempPath: responseBody.temp_path,
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

  onNameChange = (name) => {
    this.setState({
      name: name,
    })
  }

  onFieldToggle = (index) => {
    let fields = this.state.fields
    fields[index].selected = !fields[index].selected
    this.setState({
      fields: fields,
    })
  }

  onLabelChange = (index, content) => {
    let labels = this.state.labels
    if (content) {
      labels[index].name = content
    }
    else {
      labels[index].name = null
    }

    this.setState({
      labels: labels,
    })
  }

  onShortcutChange = (index, character) => {
    let labels = this.state.labels
    labels[index].shortcut = character.toUpperCase()

    this.setState({
      labels: labels,
    })
  }

  onLabelAdd = () => {
    let labels = this.state.labels
    if (labels.length === 0 || labels[labels.length -1].name) {
      labels.push(
        {name: null, shortcut: labels.length + 1, id: this.newLabelId('new_')}
      )
    }

    this.setState({
      labels: labels,
    })
  }

  onLabelDelete = (index) => {
    let labels = this.state.labels
    labels.splice(index, 1)

    this.setState({
      labels: labels,
    })
  }

  onMultipleLabelsToggle = () => {
    let multipleLabels = false
    if (!this.state.multipleLabels) {
      multipleLabels = true
    }

    this.setState({
      multipleLabels: multipleLabels,
    })
  }

  onNumLabellingsRequiredChange = (num) => {
    this.setState({
      numLabellingsRequired: num ? parseInt(num, 10) : undefined,
    })
  }

  onSubmit = async () => {
    // Remove any temporary label IDs that are just for component rendering
    let state = {}
    Object.assign(state, {labels: this.state.labels})
    let labels = state.labels.map((label) => {
      if (label.id.indexOf('new_') === 0) {
        let newLabel = {}
        Object.assign(newLabel, label)
        newLabel.id = undefined
        return newLabel
      }
      return label
    })

    // Make array of fields to display
    let fields = []
    for (let field of this.state.fields) {
      if (field.selected) {
        fields.push(field.name)
      }
    }

    let requestData = {
      name: this.state.name,
      display_fields: fields,
      labels: labels,
      multiple_labels: this.state.multipleLabels,
      num_labellings_required: this.state.numLabellingsRequired,
      temp_path: this.state.tempPath,
    }

    let formData = new FormData()
    formData.append('data', JSON.stringify(requestData))
    formData.append('csrfmiddlewaretoken', this.state.csrftoken)
    if (this.state.id) {
      formData.append('id', this.state.id)
    }

    this.setState({
      saving: true,
    })

    try {
      const response = await fetch('/api/datasets/', {
        method: 'post',
        body: formData,
      })
      if (response.ok) {
        this.props.onEdit(null)
        if (!this.state.id) {
          this.reset()
        }
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
    return <AddDataset
      started={this.state.started}
      csvUploaded={this.state.csvUploaded}
      saving={this.state.saving}
      id={this.state.id}
      name={this.state.name}
      fields={this.state.fields}
      labels={this.state.labels}
      numLabellingsRequired={this.state.numLabellingsRequired}
      numDatapoints={this.state.numDatapoints}
      onClose={this.onClose}
      onStart={this.onStart}
      onDrop={this.onDrop}
      uploading={this.state.uploading}
      uploadError={this.state.uploadError}
      onNameChange={this.onNameChange}
      onFieldToggle={this.onFieldToggle}
      onLabelChange={this.onLabelChange}
      onShortcutChange={this.onShortcutChange}
      onLabelAdd={this.onLabelAdd}
      onLabelDelete={this.onLabelDelete}
      multipleLabels={this.state.multipleLabels}
      onMultipleLabelsToggle={this.onMultipleLabelsToggle}
      onNumLabellingsRequiredChange={this.onNumLabellingsRequiredChange}
      onSubmit={this.onSubmit}
    />
  }
}
