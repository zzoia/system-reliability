import React from 'react';
import './index.scss';
import App from './app';
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { configureStore } from "@reduxjs/toolkit";
import systemSchemeGraph from './redux/systemSchemeGraphSlice';
import systemStateAdjacencyList from './redux/systemStateAdjacencyListSlice';
import investigationRequest from './redux/investigationRequestSlice';
import { saveState, loadState } from './utils/LocalStorageManager';

const store = configureStore({
  reducer: {
    systemSchemeGraph,
    systemStateAdjacencyList,
    investigationRequest
  },
  preloadedState: loadState()
});

store.subscribe(() => {
  saveState(store.getState());
})

const renderApp = () => render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./app', renderApp);
}

renderApp();