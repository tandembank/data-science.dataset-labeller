import React from 'react'
import AddDataset from '../components/AddDataset'


export default class AddDatasetContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      csrftoken: '',
      started: props.started,
      csvUploaded: props.csvUploaded,
      data: props.data,
      uploading: false,
      uploadError: null,
    }
    this.onClose = this.onClose.bind(this)
    this.onStart = this.onStart.bind(this)
    this.onDrop = this.onDrop.bind(this)
    this.onFieldToggle = this.onFieldToggle.bind(this)
    this.onShortcutChange = this.onShortcutChange.bind(this)
    // this.upload = this.upload.bind(this)
  }

  componentDidMount() {
    fetch('/api/csrf-token/')
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      else {
        throw new Error('Post Failed')
      }
    })
    .then((responseBody) => {
      this.setState({csrftoken: responseBody.csrftoken})
    })
    .catch((error) => {
      console.log('Request failed', error)
    })
  }

  onClose() {
    this.setState({
      started: false,
      csvUploaded: false,
      data: [],
    })
  }

  onStart() {
    this.setState({
      started: true,
      uploading: false,
      csvUploaded: false,
      uploadError: null,
    })
  }

  onDrop(acceptedFiles, rejectedFiles) {
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

  upload (file) {
    let formData = new FormData()
    formData.append('file', file)
    formData.append('csrfmiddlewaretoken', this.state.csrftoken)

    fetch('/api/csv-upload/', {
      method: 'post',
      body: formData,
    })
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      else {
        throw new Error('Post Failed')
      }
    })
    .then((responseBody) => {
      let data = responseBody.fields.map((item, index) => {
        return {
          name: item,
          sample: '',
          selected: false,
          shortcut: null,
        }
      })
      this.setState({
        csvUploaded: true,
        data: data,
      })
    })
    .catch((error) => {
      console.log('Request failed', error)
    })
  }

  onFieldToggle(index) {
    let data = this.state.data
    data[index].selected = !data[index].selected
    this.setState({
      data: data,
    })
  }

  onShortcutChange(index, character) {
    let data = this.state.data
    if (character) {
      data[index].shortcut = character.toUpperCase()
    }
    else {
      data[index].shortcut = null
    }
  }

  render() {
    return <AddDataset
      started={this.state.started}
      csvUploaded={this.state.csvUploaded}
      data={this.state.data}
      onClose={this.onClose}
      onStart={this.onStart}
      onDropzoneEnter={this.onDropzoneEnter}
      onDropzoneLeave={this.onDropzoneLeave}
      onDrop={this.onDrop}
      uploading={this.state.uploading}
      uploadError={this.state.uploadError}
      onFieldToggle={this.onFieldToggle}
      onShortcutChange={this.onShortcutChange}
    />
  }
}
