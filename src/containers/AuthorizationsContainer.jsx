//AuthContainer.jsx

import React, {PropTypes} from 'react'
import compose from '../utils/compose'
import partial from '../utils/partial'
import Auth from '../components/auth/Auth'


export default function AuthorizationsContainer(props) {
  return <Auth {...props} /> 
}