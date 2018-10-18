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

function createDataset(csvUploaded) {
  return (
    <div className="createDataset">
      <span className="icon iconClose" />
      <div>
        { csvUploaded ? pickFields() : uploadCSV() }
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

function pickFields() {
  return (
    <div>
      <p>Pick fields to display for labelling</p>
      <ul className="pickFields">
        <li><span className="icon iconCheck" />message_id<span className="example">sample: 152490</span></li>
        <li><span className="icon iconCheck" />date<span className="example">sample: 2018-10-18</span></li>
        <li><span className="icon iconCheck" />conversation<span className="example">sample: &lt;p&gt;Hi, I have a question about my card.</span></li>
      </ul>
      <div className="buttonBar">
        <button>Create dataset</button>
      </div>
    </div>
  )
}

const AddDataset = params => (
  <div className="AddDataset">
    { params.started ? createDataset(params.csvUploaded) : startAction(false) }
  </div>
)

export default AddDataset
