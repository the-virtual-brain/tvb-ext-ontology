import React from 'react';
import { IWorkspaceProps } from './interfaces/WorkspaceInterfaces';

const WorkspaceComponent: React.FC<IWorkspaceProps> = ({ workspace }) => {
  return (
    <div className="workspace">
      <h3>Workspace</h3>
      <div>
        <h4>Model</h4>
        {workspace.model ? <div>{workspace.model.label}</div> : <div>No model selected</div>}
      </div>
      <div>
        <h4>Connectivity</h4>
        {workspace.connectivity ? <div>{workspace.connectivity.label}</div> : <div>No connectivity selected</div>}
      </div>
      <div>
        <h4>Coupling</h4>
        {workspace.coupling ? <div>{workspace.coupling.label}</div> : <div>No coupling selected</div>}
      </div>
      <div>
        <h4>Noise</h4>
        {workspace.noise ? <div>{workspace.noise.label}</div> : <div>No noise selected</div>}
      </div>
      <div>
        <h4>Integration Method</h4>
        {workspace.integrationMethod ? <div>{workspace.integrationMethod.label}</div> : <div>No integration method selected</div>}
      </div>
    </div>
  );
};

export default WorkspaceComponent;
