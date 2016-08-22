import './Batch.less'

import $ from 'jquery'
import _ from 'lodash'
import moment from 'moment'
import 'datatables.net'
import accounting from 'accounting'
import Highcharts from 'highcharts'

import React, {PropTypes} from 'react'
import ROUTES from '../../constants/ROUTES'
import {Table, Button, ButtonGroup, Grid, Row, Col, Panel} from 'react-bootstrap'
import { pacomoTransformer, pacomoDecorator } from '../../utils/pacomo'
import Link from '../Link'

import api from '../../constants/LOCATION'
import enableTableSelection  from '../../utils/datatablesUtils' 
import {start} from '../../actions/navigation'

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
  {data:'report-date',title:'Report Date'},
  {data:'batch-number', title:'Batch'},
  {data:'keyed', title:'% Keyed'},
  {data:'avg-transactions', title:'Avg. Trans'},
  {data:'num-transactions', title:'# Trans'},
  {data:'sales', title:'Sales'},
  {data:'returns', title:'Returns'},
  {data:'net', title:'Net'}
];


const data = [];


export default class BatchSummary extends React.Component {

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

  loadBatch(token){

    $.getJSON( baseURL+"/api/batchSummary/"+token, function( data ) {

      // Sanitize amount 
      var batchReports = data.batchReport;
      // Mock returns until we get them from the service
      var returns = 0;
      for(var i=0;i<batchReports.length;i++){
        // Current Item
        var item = batchReports[i];
        // Current Amount 
        var currentAmount = item.amount;
        // Set amount with Accounting formatting
        item.amount = accounting.formatMoney(item.amount);
        // Set current date for report date
        item["report-date"] =  moment(item["batch-date"]).format('MM/DD/YYYY');
        // Set pre-paid discount.
        item["prepaid-discount"] = "$0.00";
        // Set Keyed 
        item["keyed"] = "0.00%";

        // Average Transactions
        // Sales + Returns / Transaction Count
        var averageTransaction = ( currentAmount + returns ) / item["daily_transaction_count"];
        item["avg-transactions"] = accounting.formatMoney(averageTransaction);

        // Number of Transactions 
        item["num-transactions"] = item["daily_transaction_count"];
        // Sales 
        item["sales"] = accounting.formatMoney(item.amount);
        // Returns 
        item["returns"] = accounting.formatMoney(returns);
        // Net Volume
        item["net"] = accounting.formatMoney( currentAmount - returns );
      }

      /**
       * Initialize Datatables Component 
       */
      $('#batchTable').DataTable({
        data: batchReports,
        columns:  batchSummaryColumns,
        autoWidth: false,
        paging:   true,
        ordering: true,
        info:     false,
        searching:true,
        scrollX: true
      });

      // Apply table selection 
      enableTableSelection('#batchTable', function(item){
        // Navigate to `#/batchReportsDetail` 
        // TODO : Need a React way of routing to batchReportsDetail
        //var showDetail = start("batchReportsDetail",{id:item["batch-number"]});
        
        window.location.replace(
          window.location.pathname + window.location.search + '#/batchReportsDetail/'+ item["batch-number"]
        );

      });

    });
  }

  loadBatchGraph(token) {
    var servicePathAPI = baseURL+"/api/dailyBatchGraph/"+token;

    $.getJSON(servicePathAPI, function(data){

      var result = data;
      if(result){ 
          
          var chartData = [];
          var categories = [];
          for(var i=0;i < result.length;i++){
            var item = result[i];
            var batchDate = new Date(item[0]);
            var batchAmount = item[1];
            categories.push( moment( batchDate.getTime() ).format("MM/DD/YYYY") );
            chartData.push( [ batchDate, batchAmount] );
          }

      }

      // Update sanitized data set
      var timeSeries = {
            chart: {
                type: 'column',
            },
            title: {
                text: 'Batch Summary Graph'
            },
            xAxis: {
              type: 'datetime',
              categories: categories
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'USD'
                },
                labels: {
                    overflow: 'justify'
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
              name : 'Batch Transactions',
              data: chartData
            }]
        }

      Highcharts.chart("batchChart", timeSeries);
    });
  }

  selectBatchItem(item){
    console.log(item);
  }

  componentDidMount(){
    this.loadBatch(this.props.dataToken);
    this.loadBatchGraph(this.props.dataToken);
  }

  render(){
    return(
      <div className="depositsMain">
        <div className="batchSummaryChart">
          <Grid>
            <Row>
              <Col xs={12} md={12} >
                <Panel header="Batch Transactions Graph">
                  <div id="batchChart" className="batchChart">
                </div>
                </Panel>
              </Col>
            </Row>
          </Grid>
        </div>
      
        <br/>

        <div className="monthlyVolumeTable">
          <Grid>
              <Row>
                <Col xs={12} md={12} >
                  <Panel header="Batch Summary">
                    <header><h4>Select an item from the table to view more detail.</h4></header>
                    <br/>
                    <table id="batchTable" className="batchTableContainer table table-striped table-hover"></table>
                  </Panel>
                </Col>
              </Row>
          </Grid>
        </div>     
      </div>
    )
  }
  
}