import React, { Component } from 'react';

export default class ExternalRedirect extends Component {
  componentDidMount(){
    window.location.href= this.props.to;
  }

  render(){
    return null;
  }
}
