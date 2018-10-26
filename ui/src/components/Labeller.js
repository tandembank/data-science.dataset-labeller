import React from 'react'
import LabellerDetailContainer from '../containers/LabellerDetailContainer'
import '../styles/Labeller.css'


const Labeller = params => (
  <div className="Labeller">
    <LabellerDetailContainer
      data={[
        {key: 'shape', value: 'round'},
        {key: 'color', value: 'green'},
        {key: 'texture', value: 'smooth'},
      ]}
      labels={[
        {id: 1, shortcut: 'A', name: 'Apple'},
        {id: 2, shortcut: 'O', name: 'Orange'},
        {id: 3, shortcut: 'P', name: 'Pear'},
      ]} />
  </div>
)

export default Labeller
