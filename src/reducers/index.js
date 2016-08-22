import { combineReducers } from 'redux'


import navigation from './navigationReducer'

import documentListView from './view/documentListViewReducer'
import documentView from './view/documentViewReducer'

import documentData from './data/documentDataReducer'
import tokenDataReducer from './data/tokenReducer'

export default combineReducers({
  navigation,
  view: combineReducers({
    documentList: documentListView,
    document: documentView
  }),
  data: combineReducers({
    document: documentData
  }),
  tokenData: combineReducers({
  	token: tokenDataReducer 
  })
})
