import React from 'react'
import { Link } from 'react-router-dom'
import Donut from '../components/Donut'
import '../styles/Dataset.css'


const Dataset = params => (
  <div className="Dataset">
    <div className="donut" title={params.percentComplete.toFixed(2) + `%\n` + params.numLabellingsCompleted + ' / ' + params.numTotalLabellingsRequired}>
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
      <div className="numberLarge">{params.numLabellingsRequired}</div>
      <div className="description">Labellings required</div>
    </div>
    <div className="controls">
      <span className="icon iconEdit" title="Edit" onClick={() => params.onEdit(params.id)} />
      <span className="icon iconDownload" title="Download" />
      <Link to={"/label/" + params.id}>
        <span className="icon iconLabel" title="Label data" />
      </Link>
    </div>
  </div>
)

export default Dataset
