import React from 'react'
import '../styles/AddDataset.css'


function startAction() {
  return (
    <div className="startAction">
      <div>
        <span className="icon iconAdd" />
      </div>
      <div className="addText">
        Add new dataset
      </div>
    </div>
  )
}

function createDataset(csvUploaded, data) {
  return (
    <div className="createDataset">
      <span className="icon iconClose" />
      <div>
        { csvUploaded ? pickFields(data) : uploadCSV() }
      </div>
    </div>
  )
}

function uploadCSV() {
  return (
    <div>
      <p>Select CSV to upload</p>
      <div className="dropzone">
        <div>
          <span className="icon iconUpload" />
        </div>
        <div>
          Drag and drop a file here or click to select
        </div>
      </div>
    </div>
  )
}

function field(item) {
  let shortcutField = <div className="shortcut">Shortcut key: <input type="text"></input></div>
  return (
    <li>
      <span className="clickArea">
        <span className={item.selected ? `icon iconChecked` : `icon iconCheck`} />
        <span className="name">{item.name}</span>
      </span>
      <span className="example">sample: {item.sample}</span>
      {item.selected ? shortcutField : null}
    </li>
  )
}

function pickFields(data) {
  return (
    <div>
      <p>Pick fields to display for labelling</p>
      <ul className="pickFields">
        {data.map((item) => field(item))}
      </ul>
      <div className="buttonBar">
        <button>Create dataset</button>
      </div>
    </div>
  )
}

const AddDataset = params => (
  <div className="AddDataset">
    { params.started ? createDataset(params.csvUploaded, params.data) : startAction(false) }
  </div>
)

export default AddDataset
