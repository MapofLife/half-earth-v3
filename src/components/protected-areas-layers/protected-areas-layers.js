import Component from './protected-areas-layers-component';
import { connect } from 'react-redux';
import * as actions from 'actions/google-analytics-actions';

export default  connect(null, actions)(Component);