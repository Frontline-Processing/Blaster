import './DashboardMain.less'

import $ from 'jquery'
import _ from 'lodash'
import moment from 'moment'
import Promise from 'bluebird'
import accounting from 'accounting'
import 'datatables.net'
import Highcharts from 'highcharts'

import React, {PropTypes} from 'react'
import { Button, ButtonGroup, Grid, Row, Col, Panel } from 'react-bootstrap'
import * as actions from '../actions/dashboardMainView'
import { pacomoTransformer, pacomoDecorator } from '../utils/pacomo'
import Link from './Link'

import api from '../constants/LOCATION'
import enableTableSelection  from '../utils/datatablesUtils'  

let props = {}
let baseURL = api(); 
let token = null
let netVolume = null

/**
 * Montly Volume Columns 
 */
const monthlyVolumeColumns = [
  {data:'transaction-date',title:'Month'},
  {data:'net_volume', title:'Net Volume'},
  {data:'transaction_count', title:'Count'}];

/**
 * Volume Table By Card Columns 
 */
const volumeTableByCardColumns = [
  {data:'cardType',title:'Card Type'},
  {data:'monthlyNetVolume',title:'Net Vol'},
  {data:'monthlyTransactionsLastCycle', title:'# Trans'},
  {data:'mtdNetVolume',title:'Net Vol'},
  {data:'mtdTransactionsCycle', title:'# Trans'},
  {data:'ytdNetVolume',title:'Net Vol'},
  {data:'ytdTransactionsCycle', title:'# Trans'}];

/**
 * Volume Analysis Columns 
 */
const volumeAnalysisColumns = [
  {data:'dataPoint','title':'Data Point'},
  {data:'lastCycle',title:'Last Cycle'},
  {data:'mtd', title:'MTD'},
  {data:'ytd',title:'YTD'},
  {data:'rolling12',title:'Rolling 12'}
];

let monthlyVolumeCount = 0;

/**
 * Volume Panel Component.
 */
const volumePanelInstance = ({twelveMonthVolume,ninetyDayVolume,mtdVolume}) => (
  <Grid>
    <Row>
    <Col xs={4} md={4} >
      <Panel header="12m Volume" className="panelTextCenter">
        {twelveMonthVolume}
      </Panel>
    </Col>
    <Col xs={4} md={4} >
      <Panel header="90d Volume" className="panelTextCenter">
        {ninetyDayVolume}
      </Panel>
    </Col>
    <Col xs={4} md={4} >
      <Panel header="MTD Volume" className="panelTextCenter">
        {mtdVolume}
      </Panel>
    </Col>
    </Row>
  </Grid>
);

/**
 * Volume Panel Component.
 */
const twoColumnVolumeInstance = (
  <Grid>
    <Row>
    <Col xs={6} md={6} >
      <Panel header="Monthly Volume Table" className="text-center">   
        <table id="monthlyTable" className="table table-striped table-bordered  table-hover"></table>
      </Panel>
    </Col>
    <Col xs={6} md={6} >
      <Panel header="Volume By Card" className="text-center">
        <table id="monthlyTableByCardType" className="table table-striped table-bordered table-hover">
        <thead>
            <tr>
              <th colSpan="1">Card Type</th>
              <th colSpan="2">Last Cycle</th>
              <th colSpan="2">MTD</th>
              <th colSpan="2">YTD</th>
            </tr>
            <tr>
              <th>Card</th>
              <th>Net Vol</th>
              <th># Trans</th>
              <th>Net Vol</th>
              <th># Trans</th>
              <th>Net Vol</th>
              <th># Trans</th>
            </tr>
        </thead>  
        </table>  
      </Panel>
      <Panel header="Volume Analysis" className="text-center">
        <table id="monthlyVolumeAnalysisTable" className="table table-striped table-bordered table-hover"></table>
      </Panel>
    </Col>
    </Row>
  </Grid>
);

/**
 * Dashboard defines the Dashboard Home React Component
 * which responsible for loading and storing the transactions data.
 */
export default class Dashboard extends React.Component {

  constructor(token){
    super();
    this.state = {
      mtdVolume : "N/A",
      ninetyDayVolume: "N/A",
      twelveMonthVolume: "N/A"
    };
    this._dataToken = token.dataToken;
    this._chartData = [];
    this._transactionChart = null;
  }

  get dataToken(){
    return this._dataToken;
  }

  set dataToken(token){
    this._dataToken = token;
  }

  static propTypes = {
    dataToken: PropTypes.string.isRequired,
    mtdVolume: PropTypes.string
  }

  componentDidMount(){
    this._transactionChart = null;
    this.loadAPIServices();
  }

  componentWillUnmount(){
    if(this._chartData != null) {
      this._chartData = [];
    }
    if(this._transactionChart != null) {
      this._transactionChart.destroy();
    }
  }

  /**
   * Load transactions for the main chart graph.
   */
  loadGraph(){

    var current = this;
    var servicePathAPI = baseURL+'/api/transactions/all/'+ this.dataToken;
    
    $.getJSON(servicePathAPI, function (data) {

        var result = data;
        if(result){ 
          
          var series = [];
          var categories = [];
          for(var i=0;i < result.length;i++){
            var item = result[i];
            var transDate = new Date(item[0]);
            var transAmount = item[1];
            categories.push( moment( transDate.getTime() ).format("MM/DD/YYYY") );
            current._chartData.push( [ transDate, transAmount] );
          }

        }

        // Create the transactions chart
        this._transactionChart = Highcharts.chart('mainChart', {
            rangeSelector : {
              selected : 1,
              allButtonsEnabled: true
            },
            chart: {
              zoomType: 'x',
              alignTicks: false
            },
            title : {
              text : 'Transaction Volume'
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
            series : [{
              name : 'Transactions',
              fillColor : {
                linearGradient : {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                },
                stops : [
                  [0, Highcharts.getOptions().colors[0]],
                  [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
              },
              data : current._chartData
            }]

        });

    });
  }

  loadVolumes(){

    var servicePathAPI = baseURL+'/api/transactions/volumes/'+this.dataToken;
    var current = this;
    $.getJSON(servicePathAPI, function(data){

      if(data.error){
        console.log('Error Retrieving Volume Data : '+ data.error);
        current.setState({
          mtdVolume : "N/A",
          ninetyDayVolume : "N/A",
          twelveMonthVolume : "N/A"
        });
      }

      // Set the data for the view
      current.setState({
        mtdVolume : accounting.formatMoney(data.monthToDateCycle['net_volume']),
        ninetyDayVolume : accounting.formatMoney(data.ninetyDayCycle['net_volume']) ,
        twelveMonthVolume : accounting.formatMoney(data.twelveMonthCycle['net_volume'])
      });
      
    });
  }

  /**
   * Load Monthly Volume.
   */
  loadMonthlyVolume(){
    var servicePathAPI = baseURL+'/api/transactions/monthly/'+ this.dataToken;

    $.getJSON(servicePathAPI, function( data ) {
      
      if(data.error){
        console.log( 'Error Monthly Volume Data : '+ data.error );
      }

      var totalVolume = 0; 
      var totalCount = 0;
      for(var i=0;i<data.length;i++){
        var currentItem = data[i];
        totalVolume += currentItem['net_volume'];
        totalCount += currentItem['transaction_count'];
        currentItem['transaction-date'] = moment(currentItem['transaction-date']).format('MM/YYYY');
        currentItem['net_volume'] = accounting.formatMoney(currentItem['net_volume']);
      }
      
      // Add the last row with the total volume and count.
      var totalsRow = {
        "net_volume": accounting.formatMoney(totalVolume),
        "transaction-date":"",
        "transaction_count":totalCount
      }
      data.push(totalsRow);

      /**
       * Initialize Datatable 
       */
      var monthlyTable = $('#monthlyTable').DataTable({
          data: data,
          columns:  monthlyVolumeColumns,
          autoWidth: false,
          paging:   false,
          info:     false,
          searching:false,
          scrollX: true,
          ordering: false
      });

      // Enable table selection
      enableTableSelection('#monthlyTable');
    });
  }
  
  /**
   * Load Volume By Card.
   */ 
  loadMonthlyVolumeByCard(){
    var monthlyVolumeCardData = []; 
    var servicePathAPI = baseURL+'/api/transactions/monthlyByCardType/'+ this.dataToken;

    $.getJSON(servicePathAPI, function( data ) {
      
      if(data.error){
        console.log( 'Error Monthly Volume Card Data : '+ data.error );
      } else {
        console.log( 'Loaded Monthly Volume Card Data' );
      }

      if(data){
        var lastCycle = data.lastCycle;
        var mtd = data.mtd;
        var ytd = data.ytd;

        /**
         * Initialize Datatable 
         */
        var cardTable = $('#monthlyTableByCardType').DataTable({
          autoWidth: false,
          paging:   false,
          info:     false,
          searching:false,
          scrollX: true,
          scrollY: true
        });

        var rows = [];

        // Start with Last Cycle
        for(var lprop in lastCycle){
          var lastItem = lastCycle[lprop];
          var cardItem = lastItem['card-type'];
          var netVolume = accounting.formatMoney(lastItem['net_volume']);
          var transCount = lastItem['transaction_count'];
          var newRow = [ cardItem, netVolume, transCount ];
          rows.push(newRow);
        }

        for(var mtdProp in mtd){
          var mtdItem = mtd[mtdProp]; 
          var cardItem = mtdItem['card-type'];
          var netVolume = accounting.formatMoney(mtdItem['net_volume']);
          var transCount = mtdItem['transaction_count'];

          var mtdRow = [ cardItem, '$0.00', '0', netVolume, transCount ]; 

          // Check for existing item
          var foundItem = false;
          for(var m=0;m<rows.length;m++){
            var checkItemRow = rows[m];
            if(checkItemRow[0] == cardItem){
              // Append to row
              checkItemRow.push(netVolume);
              checkItemRow.push(transCount);
              foundItem = true;
              break;
            }
          }
          if(!foundItem){
            rows.push(mtdRow);
          }
        }

        for(var ytdProp in ytd){
          var ytdItem = ytd[ytdProp]; 
          var cardItem = ytdItem['card-type'];
          var netVolume = accounting.formatMoney(ytdItem['net_volume']);
          var transCount = ytdItem['transaction_count'];

          var ytdRow = [ cardItem, '$0.00', '0', '$0.00', '0', netVolume, transCount ];

          // Check for existing item
          var foundItem = false;
          for(var n=0;n<rows.length;n++){
            var checkItemRow = rows[n];
            if(checkItemRow[0] == cardItem){
              // Append to row
              checkItemRow.push(netVolume);
              checkItemRow.push(transCount);
              foundItem = true;
              break;
            }
          }
          if(!foundItem){
            rows.push(ytdRow);
          }
        }

        // Add Rows to Datatables
        for(var i=0;i<rows.length;i++){
          cardTable.row.add(rows[i]).draw(true);
        }

        // Enable table selection
        enableTableSelection('#monthlyTableByCardType');
      }

    });
  }
  
  /**
   * Load Volume Analysis.
   */ 
  loadVolumeAnalysis(){
    
    var servicePathAPI = baseURL + '/api/transactions/volumeAnalysis/' + this.dataToken;

    $.getJSON(servicePathAPI, function(data) {

      if(data.error){
        console.log( 'Error Volume Analysis Data : '+ data.error );
        /**
         * Launch alert and set all data to zero.
         */ 
      }

      /**
       * Process the data and append a row for each datapoint.
       * All elements have the following object model.
       * last_cycle
       * mtd_cycle
       * ytd_cycle
       * rolling_12_cycle
       */

      /**
       * Sales Volume
       */
      var salesVolume = data.salesVolume;
      var salesVolumeLastCycle = (salesVolume.last_cycle != null)? accounting.formatMoney(salesVolume.last_cycle) : accounting.formatMoney(0);
      var salesVolumeMTDCycle = (salesVolume.mtd_cycle != null)? accounting.formatMoney(salesVolume.mtd_cycle) : accounting.formatMoney(0);
      var salesVolumeYTDCycle = (salesVolume.ytd_cycle != null)? accounting.formatMoney(salesVolume.ytd_cycle) : accounting.formatMoney(0);
      var salesVolumeRolling12Cycle = (salesVolume.rolling_12_cycle != null)? accounting.formatMoney(salesVolume.rolling_12_cycle) : accounting.formatMoney(0);

      /**
       * Sales Transaction Count
       */
      var salesTransactionCount = data.salesTransactionCount;
      var salesTransCountLastCycle = (salesTransactionCount.last_cycle != null)? salesTransactionCount.last_cycle : 0;
      var salesTransCountMTDCycle = (salesTransactionCount.mtd_cycle != null)? salesTransactionCount.mtd_cycle : 0;
      var salesTransCountYTDCycle = (salesTransactionCount.ytd_cycle != null)? salesTransactionCount.ytd_cycle : 0;
      var salesTransCountRolling12Cycle = (salesTransactionCount.rolling_12_cycle != null)? salesTransactionCount.rolling_12_cycle : 0;

      /**
       * Returns Volume 
       */
      var returnsVolume = data.returnsVolume;
      var returnsVolumeLastCycle = (returnsVolume.last_cycle != null)? accounting.formatMoney(returnsVolume.last_cycle) : accounting.formatMoney(0);
      var returnsVolumeMTDCycle = (returnsVolume.mtd_cycle != null)? accounting.formatMoney(returnsVolume.mtd_cycle) : accounting.formatMoney(0);
      var returnsVolumeYTDCycle = (returnsVolume.ytd_cycle != null)? accounting.formatMoney(returnsVolume.ytd_cycle) : accounting.formatMoney(0);
      var returnsVolumeRolling12Cycle = (returnsVolume.rolling_12_cycle != null)? accounting.formatMoney(returnsVolume.rolling_12_cycle) : accounting.formatMoney(0);

      /**
       * Returns Transaction Count 
       */
      var returnsTransactionCount = data.returnsTransactionCount;
      var returnsTransCountLastCycle = (returnsTransactionCount.last_cycle != null)? returnsTransactionCount.last_cycle : 0;
      var returnsTransCountMTDCycle = (returnsTransactionCount.mtd_cycle != null)? returnsTransactionCount.last_cycle : 0;
      var returnsTransCountYTDCycle = (returnsTransactionCount.ytd_cycle != null)? returnsTransactionCount.last_cycle : 0;
      var returnsTransCountRolling12Cycle = (returnsTransactionCount.rolling_12_cycle != null)? returnsTransactionCount.rolling_12_cycle : 0;

      /**
       * Keyed Volume Percent based of total sales. 
       */
      var keyedVolume = data.keyedVolume;
      var keyedVolumeLastCycle = (keyedVolume.last_cycle != null)? accounting.formatMoney(keyedVolume.last_cycle) : accounting.formatMoney(0);
      var keyedVolumeMTDCycle = (keyedVolume.mtd_cycle != null)? accounting.formatMoney(keyedVolume.mtd_cycle) : accounting.formatMoney(0);
      var keyedVolumeYTDCycle = (keyedVolume.ytd_cycle != null)? accounting.formatMoney(keyedVolume.ytd_cycle) : accounting.formatMoney(0);
      var keyedVolumeRolling12Cycle = (keyedVolume.rolling_12_cycle != null)? accounting.formatMoney(keyedVolume.rolling_12_cycle) : accounting.formatMoney(0);

      /**
       * Keyed Transaction Count based on total count.
       */
      var keyedTransactionCount = data.keyedTransactionCount;
      var keyedTransactionCountLastCycle = (keyedTransactionCount.last_cycle != null)? keyedTransactionCount.last_cycle : 0;
      var keyedTransactionCountMTDCycle = (keyedTransactionCount.mtd_cycle != null)? keyedTransactionCount.last_cycle : 0;
      var keyedTransactionCountYTDCycle = (keyedTransactionCount.ytd_cycle != null)? keyedTransactionCount.last_cycle : 0;
      var keyedTransactionCountRolling12Cycle = (keyedTransactionCount.rolling_12_cycle != null)? keyedTransactionCount.rolling_12_cycle : 0;
      
      /**
       * Chargeback Volume
       */
      var chargeBackVolume = data.chargeBackVolume;
      var chargeBackVolumeLastCycle = (chargeBackVolume.last_cycle != null)? accounting.formatMoney(chargeBackVolume.last_cycle) : accounting.formatMoney(0);
      var chargeBackVolumeMTDCycle = (chargeBackVolume.mtd_cycle != null)? accounting.formatMoney(chargeBackVolume.mtd_cycle) : accounting.formatMoney(0);
      var chargeBackVolumeYTDCycle = (chargeBackVolume.ytd_cycle != null)? accounting.formatMoney(chargeBackVolume.ytd_cycle) : accounting.formatMoney(0);
      var chargeBackVolumeRolling12Cycle = (chargeBackVolume.rolling_12_cycle != null)? accounting.formatMoney(chargeBackVolume.rolling_12_cycle) : accounting.formatMoney(0);

      /**
       * Chargeback Transaction Count.
       */
      var chargeBackTransactionCount = data.chargeBackTransactionCount;
      var chargeBackTransCountLastCycle = (chargeBackTransactionCount.last_cycle)? chargeBackTransactionCount.last_cycle : 0;
      var chargeBackTransCountMTDCycle = (chargeBackTransactionCount.mtd_cycle)? chargeBackTransactionCount.mtd_cycle : 0;
      var chargeBackTransCountYTDCycle = (chargeBackTransactionCount.ytd_cycle)? chargeBackTransactionCount.ytd_cycle : 0;
      var chargeBackTransCountRolling12Cycle = (chargeBackTransactionCount.rolling_12_cycle)? chargeBackTransactionCount.rolling_12_cycle : 0;


      const volumeAnalysisData = [
        {dataPoint:'Sales Volume',lastCycle:salesVolumeLastCycle,mtd:salesVolumeMTDCycle,ytd:salesVolumeYTDCycle,rolling12:salesVolumeRolling12Cycle},
        {dataPoint:'Sales Trans #',lastCycle:salesTransCountLastCycle,mtd:salesTransCountMTDCycle,ytd:salesTransCountYTDCycle,rolling12:salesTransCountRolling12Cycle},
        {dataPoint:'Returns Volume',lastCycle:'('+ returnsVolumeLastCycle +')',mtd:'('+ returnsVolumeMTDCycle +')',ytd:'('+ returnsVolumeYTDCycle +')',rolling12: '('+ returnsVolumeRolling12Cycle +')'},
        {dataPoint:'Returns Trans #',lastCycle:returnsTransCountLastCycle,mtd:returnsTransCountMTDCycle,ytd:returnsTransCountYTDCycle,rolling12:returnsTransCountRolling12Cycle},
        {dataPoint:'Keyed % Volume',lastCycle:keyedVolumeLastCycle,mtd:keyedVolumeMTDCycle,ytd:keyedVolumeYTDCycle,rolling12:keyedVolumeRolling12Cycle},
        {dataPoint:'Keyed %# Trans',lastCycle:keyedTransactionCountLastCycle,mtd:keyedTransactionCountMTDCycle,ytd:keyedTransactionCountYTDCycle,rolling12:keyedTransactionCountRolling12Cycle},
        {dataPoint:'Chargeback Volume',lastCycle:chargeBackVolumeLastCycle,mtd:chargeBackVolumeMTDCycle,ytd:chargeBackVolumeYTDCycle,rolling12:chargeBackVolumeRolling12Cycle},
        {dataPoint:'Chargeback Trans#',lastCycle:chargeBackTransCountLastCycle,mtd:chargeBackTransCountMTDCycle,ytd:chargeBackTransCountYTDCycle,rolling12:chargeBackTransCountRolling12Cycle}
      ];

      var volumeAnalysis = $('#monthlyVolumeAnalysisTable').DataTable({
            data:     volumeAnalysisData,
            columns:  volumeAnalysisColumns,
            autoWidth: false,
            paging:   false,
            ordering: false,
            info:     false,
            searching:false,
            scrollX: true
          })

      // Enable table selection
      enableTableSelection('#monthlyVolumeAnalysisTable');

    });
  }

  /**
   * Load all API Services to populate component UI.
   */
  loadAPIServices(){

    var selected = null;

    /**
     * Load Transactions Chart Data
     */
    this.loadGraph();

    /**
     * Load All API Services.
     */ 
    this.loadVolumes(); 
    this.loadMonthlyVolume();
    this.loadMonthlyVolumeByCard();
    this.loadVolumeAnalysis();
  }

  render(){
    return(
      <div className="dashboardMain">
        <div className="dashboardChart">
          <Grid>
            <Row>
              <Col md={12} >
                <Panel header="Daily Transactions Net Volume">
                  <div id="mainChart"></div>
                </Panel>
              </Col>
            </Row>
          </Grid>
        </div>
        
        <div className="dashboardVolumeContainer text-center">
          { volumePanelInstance(this.state) }
        </div>
        
        <div className="twoColumnContainer text-center">
          { twoColumnVolumeInstance } 
        </div>

      </div>
    )
  }

}
