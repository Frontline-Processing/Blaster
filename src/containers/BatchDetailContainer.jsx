//BatchDetailContainer.jsx

import React, {PropTypes} from 'react'
import compose from '../utils/compose'
import partial from '../utils/partial'
import BatchDetail from '../components/batch/BatchDetail'


export default function BatchSummaryContainer({state, dispatch, id}) {
  const props = {}

  return <BatchDetail {...props} dataToken={state.tokenData.token}/> 
}