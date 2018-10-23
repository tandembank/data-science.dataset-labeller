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
  }

  componentDidMount() {
    this.fetchCsrfToken()
  }

  fetchCsrfToken = async () => {
    try {
      const response = await fetch('/api/csrf-token/')
      if (response.ok) {
        let responseBody = await response.json()
        this.setState({csrftoken: responseBody.csrftoken})
      }
      else {
        throw new Error('Post Failed')
      }
    }
    catch(error) {
      console.log('Request failed', error)
    }
  }

  onClose = () => {
    this.setState({
      started: false,
      csvUploaded: false,
      data: [],
    })
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

        let data = responseBody.fields.map((item, index) => {
          return {
            name: item,
            sample: '',
            selected: false,
            shortcut: null,
          }
        })

        this.setState({
          uploading: false,
          csvUploaded: true,
          data: data,
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

  onFieldToggle = (index) => {
    let data = this.state.data
    data[index].selected = !data[index].selected
    this.setState({
      data: data,
    })
  }

  onShortcutChange = (index, character) => {
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
