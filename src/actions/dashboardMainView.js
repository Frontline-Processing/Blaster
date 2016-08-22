import T from '../constants/ACTION_TYPES'

import * as navigation from './navigation'


export function updateToken(data) {
  return 
    {
      type: T.TOKEN_DATA.UPDATE_TOKEN, data
    }
}