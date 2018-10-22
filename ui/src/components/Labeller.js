import React from 'react'
import '../styles/Labeller.css'


const Labeller = params => (
  <div className="Labeller">
    <div className="card">
        {
          params.data.map((item) => {
            return <div><span className="key">{item.key}:</span><div className="value">{item.value}</div></div>
          })
        }
    </div>
    <ul className="options">
      {
        params.labels.map((label) => {
          return <li><span className="key">{label.key}</span><span className="name">{label.name}</span></li>
        })
      }
    </ul>
  </div>
)

export default Labeller
