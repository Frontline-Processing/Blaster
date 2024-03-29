import defineActionTypes from '../utils/defineActionTypes'

export default defineActionTypes({
  /*
   * View model
   */

  DOCUMENT_LIST_VIEW: `
    SET_QUERY
  `,

  DOCUMENT_VIEW: `
    UPDATE_DATA
    SET_ERRORS
    REMOVE_STALE_ERRORS
    CLEAR
  `,

  /*
   * Data model
   */

  DOCUMENT_DATA: `
    UPDATE
  `,

  /*
   * Data model
   */

  TOKEN_DATA: `
    UPDATE_TOKEN
  `,

  /*
   * Application
   */

  NAVIGATION: `
    START
    COMPLETE
  `,

  /*
   * Dashboard
   */
   DASHBOARD: `
     INITIALIZE
     RELOAD
   `
})
