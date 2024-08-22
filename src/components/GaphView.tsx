import React, { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { fetchNodeByLabel, fetchNodeChildren } from '../handler';
import { ISelectedNodeType } from './interfaces/InfoBoxInterfaces';
import { ILinkType, INodeType } from './interfaces/GraphViewInterfaces';
import { ITreeNode } from './interfaces/TreeViewInterfaces';
import TreeViewComponent from './TreeView';

interface IGraphViewProps {
  setSelectedNode: (node: ISelectedNodeType) => void;
}

export const GraphViewComponent: React.FC<IGraphViewProps> = ({
  setSelectedNode
}) => {
  const [data, setData] = useState<{ nodes: INodeType[]; links: ILinkType[]; }>({ nodes: [], links: [] });
  const [searchLabel, setSearchLabel] = useState<string>('');
  const [treeData, setTreeData] = useState<ITreeNode | null>(null);

  useEffect(() => {
    const fetchAndSetData = async (label?: string) => {
      try {
        // Fetch data
        const result = await fetchNodeByLabel(label || '');
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setData({ nodes: [], links: [] });
      }
    };

    fetchAndSetData(searchLabel);
  }, [searchLabel]);

  const buildTree = (currentNode: INodeType): ITreeNode => {
    const nodeMap = new Map<string, ITreeNode>();

    // Initialize parents and children for all nodes in graph
    data.nodes.forEach(node => {
      nodeMap.set(node.id, {
        id: node.id,
        label: node.label,
        type: node.type,
        children: [],
        parents: []
      });
    });

    const currentTreeNode = nodeMap.get(currentNode.id)!;

    // Get parents and children
    data.links.forEach(link => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);

      if (sourceNode && targetNode) {
        if (link.target === currentNode.id) {
          currentTreeNode.parents.push(sourceNode);
        } else if (link.source === currentNode.id) {
          currentTreeNode.children.push(targetNode);
        }

        // Handle cases where a child node is also connected to the parents
        if (currentTreeNode.parents.includes(targetNode) && currentTreeNode.children.includes(sourceNode)) {
          sourceNode.parents.push(targetNode);
          targetNode.children.push(sourceNode);
        }
      }
    });

    return currentTreeNode;
  };

  const handleNodeClick = async (node: INodeType) => {
    setSelectedNode({
      label: node.label,
      type: node.type,
      definition: node.definition,
      iri: node.iri,
      childNodes: node.childNodes,
      childLinks: node.childLinks,
      collapsed: false
    });
    console.log('Node clicked: ', node);
    node.collapsed = !node.collapsed;

    // Build the tree view for the clicked node
    const tree = buildTree(node);
    setTreeData(tree);

    const connections = await fetchNodeChildren(node.label, node.id);
    console.log('GraphView connections: ', connections);
    node.childNodes = connections.nodes;
    node.childLinks = connections.links;
    console.log(node.childNodes);
    console.log(node.childLinks);

    const visibleNodes: INodeType[] = [];
    const visibleLinks: ILinkType[] = [];
    let newNodes: INodeType[] = [];
    let newLinks: ILinkType[] = [];
    const visitedIds: string[] = [];

    for (const n of data.nodes) {
      visitedIds.push(n.id);
    }

    const processNode = (n: INodeType) => {
      console.log('PROCESSING NODE: ', n);
      if (!visitedIds.includes(n.id)) {
        visitedIds.push(n.id);
        visibleNodes.push(n);
      }
      if (!n.collapsed) {
        visibleLinks.push(...n.childLinks!);
        for (const childNode of n.childNodes!) {
          processNode(childNode);
        }
      } else {
        return;
      }
    };

    processNode(node);
    newNodes = [...data.nodes, ...visibleNodes];
    newLinks = [...data.links, ...visibleLinks];
    console.log(newNodes);
    setData({ nodes: newNodes, links: newLinks });
  };

  // Handle search
  const handleSearch = () => {
    if (searchLabel.trim()) {
      setSearchLabel(searchLabel.trim());
    }
  };

  // Handle Enter key press to trigger the search
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="ontology-graph">
      <TreeViewComponent treeData={treeData} />
      <div className="search-bar">
        <input
          type="text"
          value={searchLabel}
          onChange={e => setSearchLabel(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter node label"
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div>
        {data ? (
          <ForceGraph2D
            graphData={data}
            onNodeClick={handleNodeClick}
            linkCurvature={0.25}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.label;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.fillStyle = 'black';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';

              const xCoord = node.x as number;
              const yCoord = node.y as number;
              ctx.fillText(label, xCoord, yCoord + 5);
            }}
            nodeCanvasObjectMode={() => 'after'}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
          />
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};
