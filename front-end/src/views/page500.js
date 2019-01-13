import React, { Component } from 'react';

import '../stylesheets/pageError.scss'

class page500 extends Component {

  render() {
    return (
      <div className="page404-container" style={{ touchAction: 'manipulation' }}>
        <h1 className="title-404">500</h1>
				<h2 className='subtitle-404'>Whoops, something went wrong!!</h2>
        <h3 className='subsubtitle-404'><a href="/">Try going back!</a></h3> 
      </div>
		)
  }
}

export default page500;