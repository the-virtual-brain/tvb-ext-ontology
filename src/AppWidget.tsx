import { ReactWidget } from '@jupyterlab/apputils';
import React from 'react';
import App from './App';

export class AppWidget extends ReactWidget {
  constructor() {
    super();
    this.addClass('tvbo-AppWidget');
  }

  render(): React.ReactElement {
    return <App />;
  }
}
