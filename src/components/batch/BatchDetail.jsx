import './Batch.less'

import $ from 'jquery'
import _ from 'lodash'
import 'datatables.net'
import accounting from 'accounting'
import Highcharts from 'highcharts'
import moment from 'moment'

import React, {PropTypes} from 'react'
import ROUTES from '../../constants/ROUTES'
import {Table, Button, ButtonGroup, Grid, Row, Col, Panel} from 'react-bootstrap'
import { pacomoTransformer, pacomoDecorator } from '../../utils/pacomo'
import Link from '../Link'

import api from '../../constants/LOCATION'
import enableTableSelection  from '../../utils/datatablesUtils' 


let baseURL = api();

/**
 * Batch Summary Table Data
 * Plug into model data.  
 */
const batchSummaryData = [];

/**
 * Batch Summary Columns 
 * Report Date | Terminal # | Batch # | Prepaid Discount | % Keyed | Avg. Trans | # Trans | Sales | Returns | Net 
 */
const batchSummaryColumns = [
  {data:'transaction-date',title:'Trans Date'},
  {data:'transaction-time', title:'Trans Time'},
  {data:'tran-type', title:'Trans Code'},
  {data:'keyed', title:'Keyed'},
  {data:'card-type', title:'Card Type'},
  {data:'card-number', title:'Card#'},
  {data:'auth-code', title:'Auth#'},
  // {data:'invoice', title:'Invoice#'},
  // {data:'regulated-id', title:'Regulated ID'},
  // {data:'drm-id', title:'DRM ID'},
  {data:'trans-amount', title:'Trans Amount'},
  {data:'voucher', title:'Voucher'}
  ];

const voidedDeclinedColumns = [
  {data:'report-date','title':'Report Date'},
  {data:'file-source','title':'File Source'},
  {data:'batch-number','title':'Batch #'},
  {data:'trans-date','title':'Trans Date'},
  {data:'trans-time','title':'Trans Time'},
  {data:'trans-code','title':'Trans Code'},
  {data:'keyed','title':'Keyed'},
  {data:'card-type','title':'Card Type'},
  {data:'card-number','title':'Card #'},
  {data:'auth-num','title':'Auth #'},
  {data:'reason-code','title':'Reason Code'},
  {data:'trans-amount','title':'Trans Amount'}
];

const monetaryRejectedColumns = [
  {data:'report-date','title':'Report Date'},
  {data:'file-source','title':'File Source'},
  {data:'batch-number','title':'Batch #'},
  {data:'trans-date','title':'Trans Date'},
  {data:'trans-time','title':'Trans Time'},
  {data:'trans-code','title':'Trans Code'},
  {data:'keyed','title':'Keyed'},
  {data:'card-type','title':'Card Type'},
  {data:'card-num','title':'Card #'},
  {data:'auth-code','title':'Auth #'},
  {data:'reason-code','title':'Reason Code'},
  {data:'action', 'title':'Action'},
  {data:'trans-amount','title':'Trans Amount'}
];

const data = [];

const timeSeries = {
            chart: {
                type: 'column',
            },
            title: {
                text: 'Batch Summary Graph'
            },
            subtitle: {
                text: document.ontouchstart === undefined ?
                        'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
            },
            xAxis: {
              type: 'datetime',
              categories: ['30D', '60D', '90D'],
              title: {
                text: null
              }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Deposits (USD)',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                valueSuffix: ' USD'
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 80,
                floating: true,
                borderWidth: 1,
                backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: [{
                name: '30D',
                data: [107, 31, 635]
            }, {
                name: '60D',
                data: [133, 156, 947]
            }, {
                name: '90D',
                data: [1052, 954, 4250]
            }]
        };


/**
 * rendeMainChart creates a new chart on the "mainChart" div, 
 * with chart and on load callback method.
 */
function renderMainChart(elem){
  Highcharts.chart("batchChart",timeSeries);
}

export default class BatchDetail extends React.Component {

  constructor(token){
    super();
    this._dataToken = token;

    /**
     * Define initial state by setting the default value.
     */
    this.state = { merchantName: "" };
  }

  get dataToken() {
    return this._dataToken;
  }

  set dataToken(token) {
    this._dataToken = token;
  }

  get batchNumber() {
    return this._batchNumber;
  }

  set batchNumber(value) {
    this._batchNumber = value;
  }

  get reportDate(){
    return this._reportDate;
  }

  set reportDate(value){
    this._reportDate = value;
  }

  get merchantName(){
    return this._merchant;
  }

  set merchantName(value){
    this._merchant = value;
  }

  static propTypes = {
    dataToken: PropTypes.string.isRequired,
    merchantName: PropTypes.string
  }

  loadBatchSummaryData(token){
    var current = this;

    $.getJSON( baseURL+"/api/batchByID/"+token+'/'+this.batchNumber, function( data ) {

      // Set Merchant Name
      // current.merchantName(data[0]["merchant-name"]);

      for(var i=0;i<data.length;i++){
        // Current Item
        var item = data[i];
        // Set amount with Accounting formatting
        item["trans-amount"] = accounting.formatMoney(item.amount);
        // Set current date for report date
        item["transaction-date"] = moment(item["transaction-date"]).format("MM/DD/YYYY");
        // Set terminal number.
        item["terminal-num"] = "N/A";
        // Set pre-paid discount.
        item["prepaid-discount"] = "N/A";
        // Set Keyed 
        item["keyed"] = "N/A";
        // Average Transactions
        item["avg-transactions"] = "N/A";
        // Number of Transactions 
        item["num-transactions"] = "N/A"; //item["daily_transaction_count"];
        // Sales 
        item["sales"] = accounting.formatMoney(item.amount);
        // Returns 
        item["returns"] = "N/A";
        // Net Volume
        item["net"] = "N/A";//item["net_volume"];

        item["voucher"] = "Voucher";
      }

      /**
       * Initialize Datatables Component 
       */
      $('#batchTable').DataTable({
        data: data,
        columns:  batchSummaryColumns,
        autoWidth: false,
        paging:   true,
        ordering: true,
        info:     false,
        searching:true,
        scrollX: true
      });

      // Apply table selection 
      enableTableSelection('#batchTable');

    });
  }

  loadVoidedDeclinedData(token){

      var data = [];
      /**
       * Initialize Datatables Component 
       */
      $('#voidedDeclinedTransactionsTable').DataTable({
        data: data,
        columns:  voidedDeclinedColumns,
        autoWidth: false,
        paging:   true,
        ordering: true,
        info:     false,
        searching:false,
        scrollX: true
      });

      // Apply table selection 
      enableTableSelection('#voidedDeclinedTransactionsTable');
  }

  loadMonetaryRejectedData(token){
      var data = [];
      /**
       * Initialize Datatables Component 
       */
      $('#monetaryRejectedTransactionsTable').DataTable({
        data: data,
        columns:  monetaryRejectedColumns,
        autoWidth: false,
        paging:   true,
        ordering: true,
        info:     false,
        searching:false,
        scrollX: true
      });

      // Apply table selection 
      enableTableSelection('#monetaryRejectedTransactionsTable');
  }
  
  loadMerchantInfo() {
    var current = this; 
    var servicePathAPI = api() + "/api/merchant/" + this.props.dataToken;
    $.getJSON(servicePathAPI, function(data){
      
      var merchantData = data[0];

      if(merchantData && merchantData["merchant-name"]){
        // Set the data for the view
        current.setState({
          merchantName : merchantData["merchant-name"]
        });
      }

    });
  }

  componentWillMount(){
    var location = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
    /**
     * Need to add validation to check if there is a batch number.
     */ 
    // TODO : Validate the Location never fails, if so show error dialog. 
    this.batchNumber = location[1];
    // TODO : Get actual report date.
    this.reportDate = new Date().toDateString();
  }

  componentDidMount(){
    this.loadMerchantInfo();
    this.loadBatchSummaryData(this.props.dataToken);
    this.loadVoidedDeclinedData(this.props.dataToken);
    this.loadMonetaryRejectedData(this.props.dataToken);
  }

  render(){
    return(
      <div className="depositsMain">
        <header className='header'>
          <Link
            name='batchReports'
            className={{
              'link': true
            }}>
            Back to Batch Reports
          </Link>
        </header>
              
        <br/>

        <div>
          <h3>
            Merchant: {this.state.merchantName}
          </h3>
        </div>

        <div>
          <h4>Merchant ID: {this.props.dataToken}</h4>
          <h4>Batch #: {this.batchNumber} | Report Date ({this.reportDate}) </h4>
        </div>

        <div className="monthlyVolumeTable">
          <Grid>
              <Row>
                <Col xs={12} md={12} >
                  <Panel header="Batch Summary">
                    <table id="batchTable" className="batchTableContainer table-striped table-hover"></table>
                  </Panel>
                </Col>
              </Row>
          </Grid>
        </div>

        <div id="voidedDeclinedTransactions">
          <Grid>
              <Row>
                <Col xs={12} md={12} >
                  <Panel header="Voided Declined Transactions">
                    <table id="voidedDeclinedTransactionsTable" className="batchTableContainer table-striped table-hover"></table>
                  </Panel>
                </Col>
              </Row>
          </Grid>
        </div>

        <div id="monetaryRejectedTransactions">
          <Grid>
              <Row>
                <Col xs={12} md={12} >
                  <Panel header="Monetary Rejected Transactions">
                    <table id="monetaryRejectedTransactionsTable" className="batchTableContainer table-striped table-hover"></table>
                  </Panel>
                </Col>
              </Row>
          </Grid>
        </div>
      </div>
    )
  }
  
}