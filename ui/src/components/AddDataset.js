import React from 'react'
import ReactDropzone from 'react-dropzone'
import Spinner from '../components/Spinner'
import '../styles/AddDataset.css'


const startAction = (params) => {
  return (
    <div className="startAction" onClick={() => params.onStart()}>
      <div>
        <span className="icon iconAdd" />
      </div>
      <div className="addText">
        Add new dataset
      </div>
    </div>
  )
}

const createDataset = (params) => {
  let content = null
  if (params.uploading) {
    content = (
      <div className="uploading">
        <Spinner />
        <p>Uploading…</p>
      </div>
    )
  }
  else if (params.csvUploaded) {
    content = enterMetadata(params)
  }
  else {
    content = uploadCSV(params)
  }
  return (
    <div className="createDataset">
      <span className="icon iconClose" onClick={() => params.onClose()} />
      <div>
        {content}
      </div>
    </div>
  )
}

const uploadCSV = (params) => {
  let uploadError = null
  if (params.uploadError) {
    uploadError = <p className="error">{params.uploadError}</p>
  }
  return (
    <div>
      <p>CSV file upload</p>
        {uploadError}
        <ReactDropzone
          className="dropzone"
          onDrop={params.onDrop}
          accept="text/*"
          activeClassName="dropzoneActive"
        >
          <div>
            <span className="icon iconUpload" />
          </div>
          <div>
            Drag and drop a CSV file here or click to select
          </div>
        </ReactDropzone>
    </div>
  )
}

const field = (item, index, onFieldToggle, onShortcutChange) => {
  return (
    <li key={Math.random()}>
      <span className="clickArea" onClick={() => onFieldToggle(index)}>
        <span className={item.selected ? `icon iconChecked` : `icon iconCheck`} />
        <span className="name">{item.name}</span>
      </span>
      <span className="example">sample: <strong>{item.sample}</strong></span>
    </li>
  )
}

const label = (item, index, onLabelChange) => {
  return (
    <li key={Math.random()}>
      <span className="label">
        Label
        <input type="text" className="name" placeholder="Required" defaultValue={item.name}></input>
      </span>
      <span>
        Shortcut
        <input type="text" className="shortcut" defaultValue={item.shortcut}></input>
      </span>
    </li>
  )
}

const enterMetadata = (params) => {
  return (
    <div className="enterMetadata">
      <p><strong>{params.numDatapoints}</strong> datapoints</p>
      <p>Dataset name</p>
      <input type="text" className="datasetName" placeholder="Required" onKeyUp={(e) => params.onNameChange(e.target.value)}></input>
      <p>Pick fields to display for labelling</p>
      <ul className="pickFields">
        {params.data.map((item, index) => field(item, index, params.onFieldToggle, params.onShortcutChange))}
      </ul>
      <p>Define labels</p>
      <ul className="defineLabels">
        {params.labels.map((item, index) => label(item, index, params.onLabelChange))}
      </ul>
      <div className="buttonBar">
        <button>Create dataset</button>
      </div>
    </div>
  )
}

const AddDataset = params => (
  <div className="AddDataset">
    { params.started ? createDataset(params) : startAction(params) }
  </div>
)

export default AddDataset
