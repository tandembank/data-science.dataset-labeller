import React from 'react'
import ReactDropzone from 'react-dropzone'
import Spinner from '../components/Spinner'
import '../styles/AddDataset.css'


function startAction(params) {
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

function createDataset(params) {
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
    content = pickFields(params)
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

function uploadCSV(params) {
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

function field(item, index, onFieldToggle, onShortcutChange) {
  let shortcutField = <div className="shortcut">Shortcut key: <input type="text" maxLength="1" defaultValue={item.shortcut} onKeyUp={(e) => onShortcutChange(index, e.target.value)}></input></div>
  return (
    <li key={Math.random()}>
      <span className="clickArea" onClick={() => onFieldToggle(index)}>
        <span className={item.selected ? `icon iconChecked` : `icon iconCheck`} />
        <span className="name">{item.name}</span>
      </span>
      <span className="example">sample: {item.sample}</span>
      {item.selected ? shortcutField : null}
    </li>
  )
}

function pickFields(params) {
  return (
    <div>
      <p>Pick fields to display for labelling</p>
      <ul className="pickFields">
        {params.data.map((item, index) => field(item, index, params.onFieldToggle, params.onShortcutChange))}
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
