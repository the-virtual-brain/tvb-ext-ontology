import React, { useState } from 'react';
import '../style/layout.css';
import { GraphViewComponent } from './components/GaphView';
import InfoBoxComponent from './components/InfoBox';
import WorkspaceComponent from './components/Workspace';
import { ISelectedNodeType } from './components/interfaces/InfoBoxInterfaces';
import { IWorkspaceState } from './components/interfaces/WorkspaceInterfaces';
import TreeViewComponent from './components/TreeView';

const App: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ISelectedNodeType | null>(null);

  const [workspace, setWorkspace] = useState<IWorkspaceState>({
    model: null,
    connectivity: null,
    coupling: null,
    noise: null,
    integrationMethod: null
  });

  const addToWorkspace = (node: ISelectedNodeType) => {
    setWorkspace(prevWorkspace => {
      switch (node.type) {
        case 'Neural Mass Model':
          return { ...prevWorkspace, model: node };
        case 'Noise':
          return { ...prevWorkspace, noise: node };
        case 'Coupling':
          return { ...prevWorkspace, coupling: node };
        case 'Integrator':
          return { ...prevWorkspace, integrationMethod: node };
        default:
          return prevWorkspace; // No changes if the type doesn't match
      }
    });
  };

  return (
    <div className="layout">
      <InfoBoxComponent selectedNode={selectedNode} addToWorkspace={addToWorkspace} />
      <WorkspaceComponent workspace={workspace} />
      <TreeViewComponent selectedNode={selectedNode} />
      <GraphViewComponent setSelectedNode={setSelectedNode} />
    </div>
  );
};
export default App;
