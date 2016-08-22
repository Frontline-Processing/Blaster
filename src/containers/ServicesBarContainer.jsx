//ServicesContainer.jsx

import React, {PropTypes} from 'react'
import * as actions from '../actions/dashboardMainView'
import compose from '../utils/compose'
import partial from '../utils/partial'
import ServicesBar from '../components/ServicesBar'


export default function ServicesBarContainer({dataToken}) {
  const props = {
  	dataToken: dataToken
  }

  return <ServicesBar {...props} /> 
}