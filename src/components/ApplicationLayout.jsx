import './ApplicationLayout.less'

import React, {PropTypes} from 'react'
import { Button, ButtonGroup, Grid, Row, Col } from 'react-bootstrap';
import { pacomoTransformer } from '../utils/pacomo'
import Link from './Link'
import ServicesBarContainer from '../containers/ServicesBarContainer'

/**
 * Simple utility to return whether to set the link to active.
 */
function validateLocation(locationName,loc) {
  return locationName.indexOf(loc) != -1 
}

/**
 * ApplicationLayout defines the web application two-column layout.
 * <nav> element defines the navigation.
 * <main> element defines the main detail section.
 */ 
const ApplicationLayout = ({
  children,
  locationName,
  dataToken
}) =>
  <div>
    <ServicesBarContainer dataToken={dataToken}></ServicesBarContainer>
    <div className="container-fluid">
      <div md={12}>
        {children}
      </div>
    </div>
  </div>


ApplicationLayout.propTypes = {
  children: PropTypes.element.isRequired,
  locationName: PropTypes.string,
  dataToken: PropTypes.string.isRequired
}

export default ApplicationLayout
