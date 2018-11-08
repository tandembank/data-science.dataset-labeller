import React from 'react'
import DatasetContainer from '../containers/DatasetContainer'
import Spinner from '../components/Spinner'
import AddDatasetContainer from '../containers/AddDatasetContainer';
import '../styles/Datasets.css'


const Datasets = params => (
  <div className="Datasets">
    {params.loading ?
      <div className="AddDataset"><Spinner /></div>
    :
      params.datasets.map((dataset) => {
        if (dataset.id === params.datasetEditing) {
          return <AddDatasetContainer
            key={'dataset_' + dataset.id}
            id={dataset.id}
            started={true}
            csvUploaded={true}
            name={dataset.name}
            fields={dataset.fields}
            labels={dataset.labels}
            multipleLabels={dataset.multipleLabels}
            numLabellingsRequired={dataset.numLabellingsRequired}
            numTotalLabellingsRequired={dataset.numTotalLabellingsRequired}
            numLabellingsCompleted={dataset.numLabellingsCompleted}
            numDatapoints={dataset.numDatapoints}
            onEdit={params.onEdit} />
        }
        else {
          return <DatasetContainer
            key={'dataset_' + dataset.id}
            id={dataset.id}
            name={dataset.name}
            percentComplete={dataset.percentComplete}
            createdBy={dataset.createdBy}
            createdAt={dataset.createdAt}
            numDatapoints={dataset.numDatapoints}
            numLabels={dataset.labels.length}
            numLabellingsRequired={dataset.numLabellingsRequired}
            numTotalLabellingsRequired={dataset.numTotalLabellingsRequired}
            numLabellingsCompleted={dataset.numLabellingsCompleted}
            onEdit={params.onEdit} />
        }
      })
    }
    <AddDatasetContainer
      onEdit={params.onEdit} />
  </div>
)

export default Datasets
