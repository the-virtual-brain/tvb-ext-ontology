import React, { useEffect, useState } from 'react';
import { IWorkspaceProps } from './interfaces/WorkspaceInterfaces';
import { exportWorkspace, runSimulation } from '../handler';

const WorkspaceComponent: React.FC<IWorkspaceProps> = ({ workspace, updateConnectivityOptions, resetWorkspace }) => {
  const [exportType, setExportType] = useState('py');
  const [message, setMessage] = useState<string | null>(null);
  const [directory, setDirectory] = useState('');

  const parcellationOptions = ['DesikanKilliany', 'Destrieux', 'Schaefer1000', 'hcpmmp1', 'virtualdbs'];
  const tractogramOptions = ['MghUscHcp32', 'PPMI85', 'dTOR'];

  const constructNodeData = () => {
    const nodeData = {
      model: workspace.model ? workspace.model.label : 'None',
      parcellation: workspace.parcellation ? workspace.parcellation : 'None',
      tractogram: workspace.tractogram ? workspace.tractogram : 'None',
      coupling: workspace.coupling ? workspace.coupling.label : 'None',
      noise: workspace.noise ? workspace.noise.label : 'None',
      integrationMethod: workspace.integrationMethod ? workspace.integrationMethod.label : 'None',
    };

    return nodeData;
  };

  const handleExport = async () => {
    const nodeData = constructNodeData();

    try {
      const response = await exportWorkspace(exportType, nodeData, directory);

      if (response.status === 'success') {
        setMessage(`${response.message}`);
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

  const handleRunSimulation = async () => {
    const nodeData = constructNodeData();

    try {
      const response = await runSimulation(exportType, nodeData, directory);

      if (response.status === 'success') {
        setMessage(`${response.message}`);
      } else {
        setMessage(`${response.error}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Error during simulation run: ${error.message}`);
      } else {
        setMessage('An unknown error occurred during simulation run.');
      }
    }
  };

  // set timer for success/error message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="workspace">
      <div className="workspace-header">
        <h3>Workspace</h3>
        <button className="reset-button" onClick={resetWorkspace}>Reset Workspace</button>
      </div>
      <div>
        <h4>Model</h4>
        <p>{workspace.model ? workspace.model.label : 'None'}</p>
      </div>
      <div>
        <div className="dropdown-container">
          {/* Parcellation Dropdown */}
          <div className="dropdown-section">
            <label htmlFor="parcellation">Parcellation:</label>
            <select
              id="parcellation"
              value={workspace.parcellation || ''}
              onChange={(e) => updateConnectivityOptions('parcellation', e.target.value)} // Update state on change
            >
              <option value="" disabled>Select a parcellation</option>
              {parcellationOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Tractogram Dropdown */}
          <div className="dropdown-section">
            <label htmlFor="tractogram">Tractogram:</label>
            <select
              id="tractogram"
              value={workspace.tractogram || ''}
              onChange={(e) => updateConnectivityOptions('tractogram', e.target.value)} // Update state on change
            >
              <option value="" disabled>Select a tractogram</option>
              {tractogramOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
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
          <div className="dropdown-section">
            <label htmlFor="export-type">Select export type: </label>
            <select
              id="export-type"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
            >
              <option value="py">Simulation code (.py)</option>
              <option value="xml">Model specification (.xml)</option>
              <option value="yaml">Metadata (.yaml)</option>
            </select>
          </div>
        </div>

        <div className="export-control">
          <label htmlFor="directory">Save Directory Path: </label>
          <input
            id="directory"
            type="text"
            value={directory}
            onChange={(e) => setDirectory(e.target.value)}
            placeholder="/home/user/downloads"
          />
        </div>

        <div className="button-container">
          <button className="export-button" onClick={handleExport}>Export</button>
          <button className="export-button" onClick={handleRunSimulation}>Run Simulation</button>
        </div>
        {message && <p>{message}</p>} {/* Display success/error message */}
      </div>
    </div>
  );
};

export default WorkspaceComponent;
