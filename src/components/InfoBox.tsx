import React from 'react';
import { ISelectedNodeType } from './interfaces/InfoBoxInterfaces';

interface IInfoBoxProps {
  selectedNode: {
    label: string;
    type: string;
    definition: string;
    iri: string;
  } | null;
  addToWorkspace: (node: ISelectedNodeType) => void;
}

const InfoBoxComponent: React.FC<IInfoBoxProps> = ({
  selectedNode,
  addToWorkspace
}) => {
  // Valid types for adding objects to workspace
  const validTypes = [
    'Neural Mass Model',
    'TheVirtualBrain', // TODO: change to actual type for connectivity, noise
    'Coupling',
    'Integrator'
  ];

  const isAddable = selectedNode && validTypes.includes(selectedNode.type);

  return (
    <div className="info-box">
      <h3>Concept Details</h3>
      {selectedNode ? (
        <div>
          <h3>Node Information</h3>
          <p>
            <strong>Name:</strong> {selectedNode.label}
          </p>
          <p>
            <strong>Type:</strong> {selectedNode.type}
          </p>
          <p>
            <strong>Definition:</strong> {selectedNode.definition}
          </p>
          <p>
            <strong>IRI:</strong>{' '}
            <a href={selectedNode.iri} target="_blank" rel="noopener noreferrer">
              {selectedNode.iri}
            </a>
          </p>
          <button
            onClick={() => addToWorkspace(selectedNode)}
            disabled={!isAddable}
          >
            Add to Workspace
          </button>
        </div>
      ) : (
        <p>Select a node to see its details here</p>
      )}
    </div>
  );
};

export default InfoBoxComponent;
