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
  else if (params.saving) {
    content = (
      <div className="uploading">
        <Spinner />
        <p>Saving…</p>
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
          accept="text/csv,.csv"
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

const field = (item, index, params) => {
  return (
    <li key={Math.random()}>
      <span className="clickArea" onClick={() => params.onFieldToggle(index)}>
        <span className={item.selected ? `icon iconChecked` : `icon iconCheck`} />
        <span className="name">{item.name}</span>
      </span>
      <span className="example">sample: <strong>{item.sample}</strong></span>
    </li>
  )
}

const label = (item, index, params) => {
  return (
    <li key={item.id}>
      <span className="label">
        Name
        <input type="text" className="name" placeholder="Required" defaultValue={item.name} onKeyUp={(e) => params.onLabelChange(index, e.target.value)}></input>
      </span>
      <span>
        Shortcut
        <input type="text" className="shortcut" defaultValue={item.shortcut} onKeyUp={(e) => params.onShortcutChange(index, e.target.value)}></input>
      </span>
      <span className="delete">
        <span className="icon iconDelete" onClick={() => params.onLabelDelete(index)} />
      </span>
    </li>
  )
}

const enterMetadata = (params) => {
  return (
    <div className="enterMetadata">
      <h2>Creating dataset with {params.numDatapoints} datapoints</h2>

      <p>Dataset name</p>
      <input type="text" className="datasetName" placeholder="Required" defaultValue={params.name} onKeyUp={(e) => params.onNameChange(e.target.value)}></input>

      <p>Fields to be displayed for labelling</p>
      <ul className="pickFields">
        {params.fields.map((item, index) => field(item, index, params))}
      </ul>

      <p>Labels to be chosen from</p>
      <ul className="defineLabels">
        {params.labels.map((item, index) => label(item, index, params))}
        <li className="addLabel" onClick={() => params.onLabelAdd()}><span className="icon iconAdd" />Add label</li>
      </ul>

      <p>Multiple selection of labels allowed</p>
      <div className="multipleLabels">
        <span className="clickArea" onClick={() => params.onMultipleLabelsToggle()}>
          <span className={params.multipleLabels ? `icon iconToggleOn` : `icon iconToggleOff`} />
        </span>
      </div>

      <p>Number of user labellings required per datapoint</p>
      <input type="number" className="numUserLabels" placeholder="0" min="1" max="10" defaultValue={params.numLabellingsRequired} onKeyUp={(e) => params.onnumLabellingsRequiredChange(e.target.value)} onChange={(e) => params.onnumLabellingsRequiredChange(e.target.value)}></input>

      {
        params.id ?
        ''
        :
          <div className="buttonBar">
            <button onClick={() => params.onSubmit()}>Create dataset</button>
          </div>
      }
    </div>
  )
}

const AddDataset = params => (
  <div className="AddDataset">
    { params.started ? createDataset(params) : startAction(params) }
  </div>
)

export default AddDataset
