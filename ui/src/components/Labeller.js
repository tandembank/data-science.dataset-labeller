import React from 'react'
import '../styles/Labeller.css'


const Labeller = params => (
  <div className="Labeller">
    <div className="card">
      <div><span className="key">shape:</span><div className="value">round<br />and</div></div>
      <div><span className="key">color:</span><span className="value">green</span></div>
      <div><span className="key">texture:</span><span className="value">smooth</span></div>
    </div>
    <ul className="options">
        <li><span className="key">1</span><span className="name">Apple</span></li>
        <li><span className="key">2</span><span className="name">Orange</span></li>
        <li><span className="key">3</span><span className="name">Pear</span></li>
    </ul>
  </div>
)

export default Labeller
