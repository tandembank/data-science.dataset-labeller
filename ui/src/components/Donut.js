import React from 'react'
import {PieChart, Pie, Cell, Sector} from 'recharts'


const renderActiveShape = (props) => {
  const {cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, percent} = props
  return (
    <g>
      <text
        x={32}
        y={37}
        fontSize="16"
        textAnchor="middle"
        fill="#ffffff">
        {parseInt(percent*100, 10)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

const Donut = params => {
  let percent = Math.round(params.percent)
  let data = [{name: 'complete', value: percent}, {name: 'incomplete', value: 100-percent}]

  return (
    <PieChart width={64} height={64} padding={0}>
      <Pie
        data={data}
        dataKey="value"
        cx={27}
        cy={27}
        innerRadius={25}
        outerRadius={32}
        fill="#82ca9d"
        stroke="0"
        startAngle={90}
        endAngle={-270}
        activeIndex={0}
        activeShape={renderActiveShape}
        >
        <Cell fill="#19B3A6"/>
        <Cell fill="rgba(255,255,255,0.1)"/>
      </Pie>
    </PieChart>
  )
}

export default Donut
