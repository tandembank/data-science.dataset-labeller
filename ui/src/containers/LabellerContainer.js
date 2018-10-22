import React from 'react'
import Labeller from '../components/Labeller'


export default class LabellerContainer extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    return <Labeller data={this.props.data} labels={this.props.labels} />
  }
}
