import React from 'react'
import Donut from '../components/Donut'
import '../styles/Dataset.css'


const Dataset = params => (
  <div className="Dataset">
    <div className="donut">
      <Donut percent={params.percentComplete} />
    </div>
    <div className="title">
      <div className="name">{params.name}</div>
      <div className='createdBy'>Created by {params.createdBy}<br/>On {params.createdAt}</div>
    </div>
    <div className="numDatapoints">
      <div className="numberLarge">{params.numDatapoints}</div>
      <div className="description">Datapoints</div>
    </div>
    <div className="numLabels">
      <div className="numberLarge">{params.numLabels}</div>
      <div className="description">Unique labels</div>
    </div>
    <div className="numUserLabels">
      <div className="numberLarge">{params.numUserLabels}</div>
      <div className="description">Labels per datapoint</div>
    </div>
    <div className="controls">
      <span className="icon iconEdit" title="Edit" />
      <span className="icon iconDownload" title="Download" />
      <span className="icon iconLabel" title="Label data" />
    </div>
  </div>
)

export default Dataset