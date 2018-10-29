import React from 'react'
import '../styles/LabellerDetail.css'


export default class LabellerDetail extends React.Component {
  onSelect(datapointId, labelId) {
    // TODO: Find better way of passing more than one parameter to a promise
    this.props.onSelectLabel({
      datapointId: datapointId,
      labelId: labelId
    })
  }

  render() {
    let params = this.props
    return (
      <div className="LabellerDetail">
        <div className="card">
          {
            params.data.map((item) => {
              let value = item.value
              if (Array.isArray(item.value)) {
                value = value.map((message, i) => {
                  return <p key={`message_${i}`}>{message}</p>
                })
              }
              return (
                <div key={Math.random()}>
                  <span className="key">{item.key}:</span>
                  <div className="value">{value}</div>
                </div>
              )
            })
          }
        </div>
        <ul className="options">
          {
            params.labels.map((label) => {
              // debugger
              console.log(params.datapointId)
              return (
                // <li key={label.name} onClick={() => params.onSelectLabel(params.datapointId, label.id)}>
                <li key={label.name} onClick={() => this.onSelect(params.datapointId, label.id)}>
                  <span className="shortcut">{label.shortcut}</span>
                  <span className="name">{label.name}</span>
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
}
