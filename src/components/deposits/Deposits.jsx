import './Deposits.less'

import $ from 'jquery'
import _ from 'lodash'
import accounting from 'accounting'
import 'datatables.net'
import moment from 'moment'
import Highcharts from 'highcharts'
import StringMask from 'string-mask'

import React, {PropTypes} from 'react'
import {Table, Button, ButtonGroup, Grid, Row, Col, Panel} from 'react-bootstrap'
import { pacomoTransformer, pacomoDecorator } from '../../utils/pacomo'
import Link from '../Link'

import api from '../../constants/LOCATION'
import enableTableSelection  from '../../utils/datatablesUtils' 

/**
 * Daily Deposits Columns 
 * Report Date | Deposit Date | Routing # | DDA # | # Deposits | Deposits | # Debits | Net Deposit
 */
const dailyDepositsColumns = [
  {data:'report-date',title:'Report Date'},
  {data:'deposit-date', title:'Deposit Date'},
  {data:'routing-number', title:'Routing #'},
  {data:'dda', title:'DDA #'},
  {data:'deposits-num', title:'# Deposits'},
  {data:'deposits-total', title:'Deposits'},
  {data:'debits-num', title:'Debits'}
  // {data:'net-deposit', title:'Net Deposit'}
];


/**
 * DespositsSummary React.Component defines the user interface for Deposits Summary.
 */
export default class DepositsSummary extends React.Component {

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
    dataToken: PropTypes.string.isRequired
  }

  loadDailyDepositsGraph(token){
    var baseURL = api();
    $.getJSON( baseURL+"/api/dailyDepositsGraph/"+token.dataToken, function(data) {

      var chartData = [];
      var categories = [];
      for(var i=0; i<data.length;i++) {
        var item = data[i];
        var depositDate = moment(item[0]).format("MM/DD/YYYY");
        var depDate = new Date(item[0]);

        categories.push( depositDate );
        chartData.push( [depositDate, item[1] ]);
      }

      // Update sanitized data set
      var timeSeries = {
            chart: {
                type: 'column',
            },
            title: {
                text: 'Deposits'
            },
            xAxis: {
              type: 'datetime',
              categories: categories
            },
            yAxis: {
                title: {
                    text: 'USD'
                }
            },
            tooltip: {
              formatter: function() {
                return 'Date: <b>' + moment(this.x).format("MM/DD/YYYY") + '</b> <br/> Amount: <b>$' + accounting.format(this.y) + '</b>';
              }
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            credits: {
                enabled: false
            },
            series: [{
              name: 'Deposits',
              data: chartData
            }]
        };

      Highcharts.chart("depChart",timeSeries);

    });
  }

  loadDeposits(token){
    
    var baseURL = api(); 
    $.getJSON( baseURL+"/api/dailyDeposits/"+token.dataToken, function( data ) {

      // Sanitize amount 
      var depositReports = data.depositReport;

      for(var i=0;i<depositReports.length;i++){
        var item = depositReports[i];
        var currentAmount = item.amount;
        // Set current date for report date
        item["report-date"] = moment(item["deposit-date"]).format("MM/DD/YYYY");
        // Amount
        item["amount"] = accounting.formatMoney(currentAmount);
        // Deposit Date 
        item["deposit-date"] = moment(item["deposit-date"]).format("MM/DD/YYYY");
        // Routing
        var formatter = new StringMask('xxxx0000');
        var routingMask = formatter.apply(item["routing-number"]);
        item["routing-number"] = routingMask;
        // DDA
        item["dda"] = "N/A";
        // Deposits Num
        item["deposits-num"] = "0";
        // Deposits Total
        item["deposits-total"] = accounting.formatMoney(currentAmount);
        // Number of Debits
        item["debits-num"] = "0";
        // Net Deposit
        item["net-deposit"] = "$0.00"; //item["net_volume"];
      }

      /**
       * Initialize Datatables Component 
       */
      $('#depositsTable').DataTable({
        data: depositReports,
        columns:  dailyDepositsColumns,
        autoWidth: false,
        paging:   true,
        ordering: true,
        info:     false,
        searching: false,
        scrollX: true
      });

      // Apply table selection 
      enableTableSelection('#depositsTable');

    });
  }

  chartLoaded(e){
    console.log(e);
  }

  /**
   * Render Main Chart Section
   */
  renderMainChart(elem){
    // Highcharts.chart("depChart",timeSeries);
  }

  /**
   * React LifeCycle Method, where we handle loading the deposits data from API.
   */
  componentDidMount(){
    this.loadDailyDepositsGraph(this.dataToken);
    this.loadDeposits(this.dataToken);
  }

  /**
   * React LifeCycle Method, where we handle unloading the chart and deposits.
   */
  componentWillUnmount(){
    // $('#depChart').highcharts().destroy();
  }

  /**
   * React Method, where we render the html elements.
   */
  render(){
    return(
      <div className="depositsMain">
        <div className="depositsChart">
          <Grid>
            <Row>
              <Col md={12} >
                <Panel header="Deposits Graph">
                  <div id="depChart"></div>
                </Panel>
              </Col>
            </Row>
          </Grid>
        </div>
        
        <br/>

        <div className="depositsSummaryTable">
          <Grid>
            <Row>
              <Col md={12} >
                <Panel header="Deposits Summary">
                  <table id="depositsTable" className="depositsTableContainer table table-striped"></table>
                </Panel>
              </Col>
            </Row>
          </Grid>
        </div>

      </div>
    )
  }
}
