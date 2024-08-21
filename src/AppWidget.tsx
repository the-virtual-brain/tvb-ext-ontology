import { ReactWidget } from '@jupyterlab/apputils';
import React from 'react';
import App from './App';

export class AppWidget extends ReactWidget {
  fetchData: () => Promise<any>;
  constructor(fetchData: () => Promise<any>) {
    super();
    this.addClass('tvbo-AppWidget');
    this.fetchData = fetchData;
  }

  render(): React.ReactElement {
    return <App fetchData={this.fetchData} />;
  }
}
