import $ from 'jquery'
import accounting from 'accounting'
import React, {PropTypes} from 'react'

import ApplicationLayout from './components/ApplicationLayout'
import DashboardMainContainer from './containers/DashboardMainContainer'
import DepositsContainer from './containers/DepositsContainer'
import AuthorizationsContainer from './containers/AuthorizationsContainer'
import BatchSummaryContainer from './containers/BatchSummaryContainer'
import BatchDetailContainer from './containers/BatchDetailContainer'
import GatewayLoginContainer from './containers/GatewayLoginContainer'
import OnlineCardDepositsLoginContainer from './containers/OnlineCardDepositsLoginContainer'
import PCILoginContainer from './containers/PCILoginContainer'

import {updateToken} from './actions/dashboardMainView'

// Application is the root component for dashboard application.
export default function Application(props) {

  // Access Current for the MID Token
  let currentTag = document.querySelector('script[id="mcd"]');
  let dataToken = currentTag.getAttribute('data-token');
  let envToken = currentTag.getAttribute('data-env');

  if(!envToken){
    envToken = 'production';
  }
  console.log('Environment : ' + envToken);

  // Set Application Tokens - TODO Add Reducers for these properties
  // String value Need to send an Action to update tokenData
  // Set manually, should be props.dispatch(updateToken('token', dataToken));
  updateToken(dataToken);
  props.state.tokenData = { token: dataToken }; 

  // Unauthorized Access Response
  // TODO : Convert to Component and Render Component vs Inline HTML.
  if(!props.state.tokenData.token){
    return (
        <div className="container">
          <h3>401 Unauthorized Access. Your IP has been logged.</h3>
        </div>
      )
  }

  // Given we have moved ahead we can apply the accounting settings
  // Accounting default parameters:
  accounting.settings = {
    currency: {
      symbol : "$",   // default currency symbol is '$'
      format: "%s%v", // controls output: %s = symbol, %v = value/number (can be object: see below)
      decimal : ".",  // decimal point separator
      thousand: ",",  // thousands separator
      precision : 2   // decimal places
    },
    number: {
      precision : 0,  // default precision on numbers is 0
      thousand: ",",
      decimal : "."
    }
  }

  return (
    <ApplicationLayout locationName={props.state.navigation.location.name} dataToken={props.state.tokenData.token}>
      {selectChildContainer(props)}
    </ApplicationLayout>
  )
}

Application.propTypes = {
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
}

// Select which container to render into the view 
const selectChildContainer = props => {
  const location = props.state.navigation.location

  let child
  switch (location.name) { 
    case 'dashboard':
      return <DashboardMainContainer {...props} dataToken={props.state.tokenData.token} id={location.options.id}>{child}</DashboardMainContainer>
    case 'depositsReports':
      return <DepositsContainer {...props} dataToken={props.state.tokenData.token} id={location.options.id}>{child}</DepositsContainer>
    case 'batchReportsDetail':
      return <BatchDetailContainer {...props} dataToken={props.state.tokenData.token} props={props} id={location.options.id}>{child}</BatchDetailContainer>      
    case 'batchReports':
      return <BatchSummaryContainer {...props} dataToken={props.state.tokenData.token} props={props} id={location.options.id}>{child}</BatchSummaryContainer>
    case 'authReports':
      return <AuthorizationsContainer {...props} dataToken={props.state.tokenData.token}  id={location.options.id}>{child}</AuthorizationsContainer> 
    
    default:
      return '404 Document Not Found'
  }
}
