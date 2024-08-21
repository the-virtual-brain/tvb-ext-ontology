import React, { useState } from 'react';
import '../style/layout.css';
import { GraphViewComponent } from './components/GaphView';
import InfoBoxComponent from './components/InfoBox';
import WorkspaceComponent from './components/Workspace';
import { ISelectedNodeType } from './components/interfaces/InfoBoxInterfaces';
import { IWorkspaceState } from './components/interfaces/WorkspaceInterfaces';

interface IAppProps {
  fetchData: () => Promise<any>;
}

const App: React.FC<IAppProps> = () => {
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
        case 'TheVirtualBrain':
          if (node.label.includes('Noise')) {
            return { ...prevWorkspace, noise: node };
          } else {
            return { ...prevWorkspace, connectivity: node };
          }
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
      <GraphViewComponent setSelectedNode={setSelectedNode} />
    </div>
  );
};
export default App;
