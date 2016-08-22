//ChargebackLoginContainer.jsx

import React, {PropTypes} from 'react'
import compose from '../utils/compose'
import partial from '../utils/partial'
import GatewayLogin from '../components/gateway/GatewayLogin'


export default function GatewayLoginContainer({state, dispatch, id}) {
  const props = {}

  return <GatewayLogin />; 
}