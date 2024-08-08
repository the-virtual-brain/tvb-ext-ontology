import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { fetchNodeByLabel, fetchNodeConnections } from './handler';
import { ILauncher } from '@jupyterlab/launcher';
import { LabIcon } from '@jupyterlab/ui-components';

import ontologyIconSVG from '../style/tvbo_favicon.svg';
import { AppWidget } from './AppWidget';

const ontologyIcon = new LabIcon({
  name: 'custom:ontology-icon',
  svgstr: ontologyIconSVG
});

/**
 * Initialization data for the tvb-ext-ontology extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'tvb-ext-ontology:plugin',
  description: 'A JupyterLab extension.',
  autoStart: true,
  requires: [ILauncher],
  activate: async (app: JupyterFrontEnd, launcher: ILauncher) => {
    console.log('JupyterLab extension tvb-ext-ontology is activated!');

    const commandID = 'tvb-ext-ontology:open';

    app.commands.addCommand(commandID, {
      label: 'Ontology Widget',
      icon: ontologyIcon,
      execute: () => {
        // const widget = new OntologyWidget(() =>
        const widget = new AppWidget(() => fetchNodeByLabel('JansenRit'));
        widget.id = 'tvb-ext-ontology-widget';
        widget.title.label = 'Ontology Graph';
        widget.title.closable = true;

        if (!widget.isAttached) {
          app.shell.add(widget, 'main');
        }
        app.shell.activateById(widget.id);
      }
    });

    launcher.add({
      command: commandID,
      category: 'Widgets',
      rank: 0
    });
  }
};

export default plugin;
