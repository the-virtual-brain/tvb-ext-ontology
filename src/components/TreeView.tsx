import React from 'react';
import { ITreeNode } from './interfaces/TreeViewInterfaces';

interface ITreeViewProps {
  treeData: ITreeNode | null;
}

const TreeViewComponent: React.FC<ITreeViewProps> = ({ treeData }) => {
  const renderTree = (node: ITreeNode) => (
    <ul key={node.id}>
      {node.parents.map(parent => (
        <li key={parent.id}>
          {parent.label} (Parent)
          {parent.children.length > 0 && renderTree(parent)}
        </li>
      ))}
      <li>
        <strong>{node.label} (Current)</strong>
        {node.children.length > 0 && (
          <ul>
            {node.children.map(child => (
              <li key={child.id}>
                {child.label} (Child)
                {child.children.length > 0 && renderTree(child)}
              </li>
            ))}
          </ul>
        )}
      </li>
    </ul>
  );
  return (
    <div>
      <h3>Tree View</h3>
      {treeData ? renderTree(treeData) : <p>Please select a node first</p>}
    </div>
  );
};

export default TreeViewComponent;
