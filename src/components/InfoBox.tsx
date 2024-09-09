import React from 'react';
import { ISelectedNodeType } from './interfaces/InfoBoxInterfaces';
import { fetchNodeByLabel } from '../handler';

interface IInfoBoxProps {
  selectedNode: {
    id: string;
    label: string;
    type: string;
    definition: string;
    iri: string;
    requires: string[];
  } | null;
  addToWorkspace: (node: ISelectedNodeType) => void;
}

const InfoBoxComponent: React.FC<IInfoBoxProps> = ({ selectedNode, addToWorkspace }) => {
  // Valid types for adding objects to workspace
  // TODO: add valid type for connectivity
  const validTypes = ['Neural Mass Model', 'Noise', 'Coupling', 'Integrator'];

  const isAddable = selectedNode && validTypes.includes(selectedNode.type);

  const handleAddToWorkspace = async () => {
    if (!selectedNode) return;

    if (isAddable) {
      addToWorkspace(selectedNode);

      // check requirements of selected node
      if (selectedNode.requires && selectedNode.requires.length > 0) {
        const requiredNodePromises = selectedNode.requires.map(label => fetchNodeByLabel(label));
        const requiredNodesResponses = await Promise.all(requiredNodePromises);

        requiredNodesResponses.forEach(response => {
          const { nodes } = response; // Extract nodes from the response
          nodes.forEach(node => {
            if (validTypes.includes(node.type) && (node.type !== selectedNode.type)) {  // check for same type as selected node to not overwrite it
              addToWorkspace(node);
            }
          });
        });
      }
    } else {
      console.warn(`Node type "${selectedNode.type}" is not allowed in the workspace.`);
    }
  };

  return (
    <div className="info-box">
      <h3>Concept Details</h3>
      {selectedNode ? (
        <div>
          <div className="node-info-container">
            <div className="node-info">
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
            </div>
            <button
              className="add-button"
              onClick={handleAddToWorkspace}
              disabled={!isAddable}
            >
              Add to Workspace
            </button>
          </div>
        </div>
      ) : (
        <p>Select a node to see its details here</p>
      )}
    </div>
  );
};

export default InfoBoxComponent;
