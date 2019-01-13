import React, { Component } from 'react';

import '../stylesheets/pageError.scss'

class page404 extends Component {

  render() {
    return (
      <div className="page404-container" style={{ touchAction: 'manipulation' }}>
        <h1 className="title-404">404</h1>
				<h2 className='subtitle-404'>OPPS, SORRY WE CAN'T FIND THAT PAGE!</h2>
				<h3 className='subsubtitle-404'><a href="/">Go back Home</a></h3> 
      </div>
		)
  }
}

export default page404;