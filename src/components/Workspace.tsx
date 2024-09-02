import React, { useState } from 'react';
import { IWorkspaceProps } from './interfaces/WorkspaceInterfaces';
import { exportWorkspace } from '../handler';

const WorkspaceComponent: React.FC<IWorkspaceProps> = ({ workspace }) => {
  const [exportType, setExportType] = useState('python file');
  const [message, setMessage] = useState<string | null>(null);
  const [filename, setFilename] = useState('workspace_export'); // Default filename

  const handleExport = async () => {
    const nodeData = {
      model: workspace.model ? workspace.model.label : 'None',
      connectivity: workspace.connectivity ? workspace.connectivity.label : 'None',
      coupling: workspace.coupling ? workspace.coupling.label : 'None',
      noise: workspace.noise ? workspace.noise.label : 'None',
      integrationMethod: workspace.integrationMethod ? workspace.integrationMethod.label : 'None',
    };

    try {
      const response = await exportWorkspace(exportType, nodeData, filename);

      if (response.status === 'success') {
        setMessage(`File saved successfully: ${response.message}`);
      } else {
        setMessage(`Failed to save file: ${response.error}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Error during export: ${error.message}`);
      } else {
        setMessage('An unknown error occurred during export.');
      }
    }
  };

  return (
    <div className="workspace">
      <h3>Workspace</h3>
      <div>
        <h4>Model</h4>
        <p>{workspace.model ? workspace.model.label : 'None'}</p>
      </div>
      <div>
        <h4>Connectivity</h4>
        <p>{workspace.connectivity ? workspace.connectivity.label : 'None'}</p>
      </div>
      <div>
        <h4>Coupling</h4>
        <p>{workspace.coupling ? workspace.coupling.label : 'None'}</p>
      </div>
      <div>
        <h4>Noise</h4>
        <p>{workspace.noise ? workspace.noise.label : 'None'}</p>
      </div>
      <div>
        <h4>Integration Method</h4>
        <p>{workspace.integrationMethod ? workspace.integrationMethod.label : 'None'}</p>
      </div>

      {/* Export controls */}
      <div className="export-controls">
        <div className="export-control">
          <label htmlFor="export-type">Select export type: </label>
          <select
            id="export-type"
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
          >
            <option value="python file">Python File</option>
            <option value="xml file">XML File</option>
          </select>
        </div>

        <div className="export-control">
          <label htmlFor="filename">Filename: </label>
          <input
            id="filename"
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
        </div>

        <button className="export-button" onClick={handleExport}>Export</button>
        {message && <p>{message}</p>} {/* Display success/error message */}
      </div>
    </div>
  );
};

export default WorkspaceComponent;
