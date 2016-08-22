//BatchSummaryContainer.jsx

import React, {PropTypes} from 'react'
import compose from '../utils/compose'
import partial from '../utils/partial'
import Batch from '../components/batch/Batch'


export default function BatchSummaryContainer({state, dispatch, id}) {
  const props = {}

  return <Batch {...props} dataToken={state.tokenData.token}/> 
}