import React, {PropTypes} from 'react'
import * as actions from '../actions/dashboardMainView'
import compose from '../utils/compose'
import partial from '../utils/partial'
import DashboardMain from '../components/DashboardMain'


export default function DashboardMainContainer({state, dispatch, id}) {  

	/**
	 * Need to compose the props from the incoming state, dispatch and id
	 */ 	
	const props = {
		dataToken : state.tokenData.token,
		onTokenUpdate: compose(dispatch, partial(actions.updateToken,id))
	}

  	return <DashboardMain {...props} dataToken={state.tokenData.token} />
}