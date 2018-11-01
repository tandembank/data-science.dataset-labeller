import React from 'react'
import LabellerDetailContainer from '../containers/LabellerDetailContainer'
import '../styles/Labeller.css'


const Labeller = params => (
  <div className="Labeller">
    <LabellerDetailContainer
      datapointId={params.datapoint.id}
      data={params.datapoint.data}
      labels={params.labels}
      onSelectLabel={params.onSelectLabel}
      undoAvailable={params.undoAvailable}
      onUndo={params.onUndo}
    />
  </div>
)

export default Labeller
