import React from 'react'
import '../styles/LabellerDetail.css'


const LabellerDetail = params => (
  <div className="LabellerDetail">
    <div className="card">
        {
          params.data.map((item) => {
            return (
              <div key={Math.random()}>
                <span className="key">{item.key}:</span>
                <div className="value">{item.value}</div>
              </div>
            )
          })
        }
    </div>
    <ul className="options">
      {
        params.labels.map((label) => {
          return (
            <li key={label.name}>
              <span className="shortcut">{label.shortcut}</span>
              <span className="name">{label.name}</span>
            </li>
          )
        })
      }
    </ul>
  </div>
)

export default LabellerDetail
