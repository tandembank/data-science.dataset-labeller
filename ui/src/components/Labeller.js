import React from 'react'
import LabellerDetailContainer from '../containers/LabellerDetailContainer'


const Labeller = params => (
  <LabellerDetailContainer
    datapointId={params.datapoint.id}
    data={params.datapoint.data}
    labels={params.labels}
    onSelectLabel={params.onSelectLabel}
    undoAvailable={params.undoAvailable}
    onUndo={params.onUndo}
  />
)

export default Labeller
