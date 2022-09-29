import { getSidebarTabs } from 'constants/ui-params';

import * as actions from './actions';

const sidebarTabs = getSidebarTabs();

export const initialState = {
  sidebarTabActive: sidebarTabs[0].slug,
};

const setSidebarTabActive = (state, { payload }) => ({
  ...state,
  sidebarTabActive: payload,
});

export default {
  [actions.setSidebarTabActive]: setSidebarTabActive,
};