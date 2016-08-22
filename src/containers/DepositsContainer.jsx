//DepositsContainer.jsx

import React, {PropTypes} from 'react'
import compose from '../utils/compose'
import partial from '../utils/partial'
import ServicesBar from '../components/deposits/Deposits'


export default function DepositsContainer({state, dispatch, id}) {
  
  const props = {
  	
  }

  return <ServicesBar {...props} dataToken={state.tokenData.token} /> 
}