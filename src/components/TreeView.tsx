import React, { useEffect, useState } from 'react';
import { ILinkType, INodeType } from './interfaces/GraphViewInterfaces';
import { fetchNodeChildren, fetchNodeParents } from '../handler';

interface ITreeViewProps {
  selectedNode: INodeType | null;
}

interface INodeRelation {
  node: INodeType;
  relation: string;
}

const TreeViewComponent: React.FC<ITreeViewProps> = ({ selectedNode }) => {
  const [parents, setParents] = useState<INodeRelation[]>([]);
  const [children, setChildren] = useState<INodeRelation[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedNode) {
      return;
    }
    // clear the lists every time a new node is selected
    setParents([]);
    setChildren([]);

    const fetchAndSetParents = async () => {
      try {
        const { nodes, links } = await fetchNodeParents(
          selectedNode.label,
          selectedNode.id
        );
        const parentData = processNodeRelations(
          nodes,
          links,
          selectedNode.id,
          'parents'
        );
        setParents(parentData);
      } catch (error) {
        console.error('Failed to fetch parents:', error);
      }
    };

    const fetchAndSetChildren = async () => {
      try {
        const { nodes, links } = await fetchNodeChildren(
          selectedNode.label,
          selectedNode.id
        );
        const childData = processNodeRelations(
          nodes,
          links,
          selectedNode.id,
          'children'
        );
        setChildren(childData);
      } catch (error) {
        console.error('Failed to fetch children:', error);
      }
    };

    fetchAndSetParents();
    fetchAndSetChildren();

    if (selectedNode.requires && selectedNode.requires.length > 0) {
      setRequirements(selectedNode.requires);
    } else {
      setRequirements([]);
    }
  }, [selectedNode]);

  const processNodeRelations = (
    nodes: INodeType[],
    links: ILinkType[],
    currentNodeId: number,
    type: 'parents' | 'children'
  ): INodeRelation[] => {
    return links
      .filter((link: ILinkType) =>
        type === 'parents'
          ? link.target === currentNodeId
          : link.source === currentNodeId
      )
      .map((link: ILinkType) => {
        const relatedNode = nodes.find((node: INodeType) =>
          type === 'parents' ? node.id === link.source : node.id === link.target
        );
        return relatedNode ? { node: relatedNode, relation: link.type } : null;
      })
      .filter(Boolean) as INodeRelation[]; // Remove any null values
  };

  return (
    <div className="tree-view">
      <h3>Node Connections</h3>
      {selectedNode ? (
        <>
          <h2 style={{ textAlign: 'center' }}>{selectedNode.label}</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Parents Column */}
            <div>
              <h3>Parents</h3>
              {parents.length > 0 ? (
                <ul>
                  {parents.map(({ node, relation }) => (
                    <li key={node.id}>
                      {node.label} ({relation})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No parents found.</p>
              )}
            </div>

            {/* Children Column */}
            <div style={{ marginLeft: '20px' }}>
              <h3>Children</h3>
              {children.length > 0 ? (
                <ul>
                  {children.map(({ node, relation }) => (
                    <li key={node.id}>
                      {node.label} ({relation})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No children found.</p>
              )}
            </div>
            {/* Requires Column */}
            {requirements.length > 0 && (
              <div style={{ marginLeft: '20px' }}>
                <h3>Requires</h3>
                <ul>
                  {requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      ) : (
        <p>Please select a node to see its connections</p>
      )}
    </div>
  );
};

export default TreeViewComponent;
