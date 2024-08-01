import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the tvb-ext-ontology extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'tvb-ext-ontology:plugin',
  description: 'A JupyterLab extension.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension tvb-ext-ontology is activated!');

    requestAPI<any>('get-example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The tvb_ext_ontology server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
