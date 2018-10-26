import React from 'react'
import LabellerDetail from '../components/LabellerDetail'


export default class LabellerDetailContainer extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    return <LabellerDetail
      data={this.props.data}
      labels={this.props.labels}
      onSelectLabel={this.props.onSelectLabel}
    />
  }
}
