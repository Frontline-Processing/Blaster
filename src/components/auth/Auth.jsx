import './Auth.less'

import $ from 'jquery'
import _ from 'lodash'
import accounting from 'accounting'
import 'datatables.net'
import moment from 'moment'

import React, {PropTypes} from 'react'
import {Table, Button, ButtonGroup, Grid, Row, Col, Panel} from 'react-bootstrap'
import { pacomoTransformer, pacomoDecorator } from '../../utils/pacomo'
import Link from '../Link'

import api from '../../constants/LOCATION'
import enableTableSelection  from '../../utils/datatablesUtils' 


/**
 * Auth Table Columns 
 * Report Date | Terminal # | Batch # | Prepaid Discount | % Keyed | Avg. Trans | # Trans | Sales | Returns | Net 
 */
const authTableColumns = [
  {data:'transaction-date', title:'Trans Date'},
  {data:'approval-date', title:'Approval Date'},
  {data:'auth-code', title:'Auth Code'},
  {data:'card-expiry', title:'Card Exp.'},
  {data:'card-number', title:'Card #'},
  {data:'card-type', title:'Card Type'},
  {data:'tran-identifier', title:'Trans ID'},
  {data:'amount', title:'Amount'}
];

/**
 * Auth defines the Authorizations React Component
 * which responsible for loading and storing the authorizations data.
 */ 
export default class Auth extends React.Component {

  constructor(token){
    super();
    this._dataToken = token;
  }

  get dataToken() {
    return this._dataToken;
  }

  set dataToken(token) {
    this._dataToken = token;
  }

  static propTypes = {
    dataToken: PropTypes.string.isRequired,
    redux: React.PropTypes.object
  }

  /**
   * Load the authorizations data each time we load the page.
   * No data is saved locally.
   */ 
  loadAuthorizations (token) {

    var baseURL = api(); 
    $.getJSON( baseURL+"/api/authorizations/"+token, function( data ) {

      // Sanitize amount 
      for(var i=0;i<data.length;i++){
        var item = data[i];
        item.amount = accounting.formatMoney(item.amount);
        item["approval-date"] = moment(item["approval-date"]).format("MM/DD/YYYY");
        item["transaction-date"] = moment(item["transaction-date"]).format("MM/DD/YYYY");
      }

      /**
       * Initialize Datatables Component 
       */
      $('#authorizationsTable').DataTable({
                data: data,
                columns:  authTableColumns,
                autoWidth: false,
                paging:   true,
                ordering: true,
                info:     false,
                searching:true,
                scrollX: true
              });

      // Apply table selection 
      enableTableSelection('#authorizationsTable');

    });
  }

  /**
   * Component Did Mount, React.Component Lifecycle Method
   */
  componentDidMount () {
    this.loadAuthorizations(this.props.dataToken);
  }

  /**
   * Render, React.Component Lifecycle Method
   */
  render() {
    return (
      <div md={12}>
        <div className='authorizationsContainer'>
          <Grid>
            <Row>
              <Col xs={12} md={12} >
                <Panel header="Credit Card Authorizations">
                  <table id="authorizationsTable" className="authorizationsTableContainer table table-striped table-hover"></table>
                </Panel>
              </Col>
            </Row>
          </Grid>
        </div> 
      </div>
    );
  }
}