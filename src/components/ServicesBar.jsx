import './ServicesBar.less'

import $ from 'jquery'
import _ from 'lodash'

import React, {PropTypes} from 'react'
import Link from './Link'
import { Button, ButtonGroup, Grid, Row, Col, Panel } from 'react-bootstrap';

import api from '../constants/LOCATION'

export default class ServicesBar extends React.Component {

  /**
   * Constructor
   */
  constructor(){
    super();

    /**
     * Define initial state by setting the default value.
     */
    this.state = { 
      merchantName: ""
    };
  }

  static propTypes = {
    dataToken: PropTypes.string.isRequired,
    merchantName: PropTypes.string
  }

  get locationName() {
    return this._locationName;
  }

  set locationName(value) {
    this._locationName = value;
  }

  get merchantName() {
    return this._merchantName;
  }

  set merchantName(value) {
    this._merchantName = value;
  }

  componentWillMount() {
    this.loadMerchantInfo();
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

  render(){
    return(
        <nav className="navbar navbar-inverse">
          <div id="services" className="container-fluid">

            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#fp-navbar-collapse-1" aria-expanded="false">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="#"> <img src="images/pp_logo.png"/> </a>
            </div>

            <div className="collapse navbar-collapse" id="fp-navbar-collapse-1">
              <ul className="nav navbar-nav">
                <li><a href="#">Home</a></li>
                <li><a href="#/authReports">Authorizations</a></li>
                <li><a href="#/depositsReports">Deposits</a></li>
                <li><a href="#/batchReports">Batch</a></li>
              </ul>
              
              <ul className="nav navbar-nav navbar-right">
                <li><div className="merchant-name">{this.state.merchantName}</div></li>
              </ul>
            </div>

        </div>
      </nav>
    )
  }
}