import React from 'react'
import LabellerDetailContainer from '../containers/LabellerDetailContainer'
import '../styles/Labeller.css'


const Labeller = params => (
  <div className="Labeller">
    <LabellerDetailContainer
      data={params.datapoint}
      labels={params.labels} />
  </div>
)

export default Labeller
