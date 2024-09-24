import React, { useCallback, useEffect, useRef, useState } from 'react';

import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
  NodeObject
} from 'react-force-graph-2d';
import {
  fetchNodeByLabel,
  fetchNodeChildren,
  fetchNodeParents,
  fetchNodeConnections
} from '../handler';

import { ISelectedNodeType } from './interfaces/InfoBoxInterfaces';
import { ILinkType, INodeType } from './interfaces/GraphViewInterfaces';

interface IGraphViewProps {
  setSelectedNode: (node: ISelectedNodeType) => void;
}

export const GraphViewComponent: React.FC<IGraphViewProps> = ({
  setSelectedNode
}) => {
  const [data, setData] = useState<{ nodes: INodeType[]; links: ILinkType[] }>({
    nodes: [],
    links: []
  });
  const [searchLabel, setSearchLabel] = useState<string>('');
  const [highlightNode, setHighlightNode] = useState<INodeType | null>(null);
  const NODE_RADIUS = 4;
  const fgRef =
    useRef<ForceGraphMethods<NodeObject<INodeType>, LinkObject<ILinkType>>>();
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);

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

  const handleNodeClick = async (node: INodeType) => {
    setSelectedNode({
      id: node.id,
      label: node.label,
      type: node.type,
      definition: node.definition,
      iri: node.iri,
      requires: node.requires,
      childNodes: node.childNodes,
      childLinks: node.childLinks,
      collapsed: false
    });
    setHighlightNode(node);

    // if (fgRef.current && node.x !== undefined && node.y !== undefined) {
    //   fgRef.current.centerAt(node.x, node.y, 1000); // Center with animation
    // }

    console.log('Node clicked: ', node);
    node.collapsed = !node.collapsed;

    // Fetch both children and parents
    const [childrenConnections, parentsConnections] = await Promise.all([
      fetchNodeChildren(node.label, node.id),
      fetchNodeParents(node.label, node.id)
    ]);

    // Combine connections from children and parents
    const combinedConnections = {
      nodes: [...childrenConnections.nodes, ...parentsConnections.nodes],
      links: [...childrenConnections.links, ...parentsConnections.links]
    };

    node.childNodes = combinedConnections.nodes;
    node.childLinks = combinedConnections.links;

    const visibleNodes: INodeType[] = [];
    const visibleLinks: ILinkType[] = [];
    let newNodes: INodeType[] = [];
    let newLinks: ILinkType[] = [];
    const visitedIds: number[] = [];

    for (const n of data.nodes) {
      visitedIds.push(n.id);
    }

    const processNode = (n: INodeType) => {
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
    setData({ nodes: newNodes, links: newLinks });

    const res = await fetchNodeConnections('');
    setData(res);
  };

  // highlight selected node
  const paintRing = useCallback(
    (node: INodeType, ctx: CanvasRenderingContext2D) => {
      if (highlightNode && node.id === highlightNode.id) {
        ctx.beginPath();
        ctx.arc(
          node.x as number,
          node.y as number,
          NODE_RADIUS,
          0,
          2 * Math.PI,
          false
        );
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    },
    [highlightNode]
  );

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

  // center graph when it is first rendered
  useEffect(() => {
    if (fgRef.current && data.nodes.length > 0 && isInitialRender) {
      fgRef.current.centerAt(75, 75);
      setIsInitialRender(false);
    }
  }, [data, isInitialRender]);

  const graphContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="ontology-graph">
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
      <div ref={graphContainerRef} className="graph-container">
        {data ? (
          <ForceGraph2D
            ref={fgRef}
            graphData={data}
            onNodeClick={handleNodeClick}
            linkCurvature={0.15}
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

              // Draw cross in the center of the canvas TODO: Remove this
              const canvasWidth =
                graphContainerRef.current?.clientWidth ?? ctx.canvas.width;

              const canvasHeight =
                graphContainerRef.current?.clientHeight ?? ctx.canvas.height;
              const crossSize = 10;

              // Vertical line of the cross
              ctx.beginPath();
              ctx.moveTo(canvasWidth / 2, canvasHeight / 2 - crossSize);
              ctx.lineTo(canvasWidth / 2, canvasHeight / 2 + crossSize);
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              // Horizontal line of the cross
              ctx.beginPath();
              ctx.moveTo(canvasWidth / 2 - crossSize, canvasHeight / 2);
              ctx.lineTo(canvasWidth / 2 + crossSize, canvasHeight / 2);
              ctx.strokeStyle = 'blue';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              paintRing(node, ctx);
            }}
            nodeCanvasObjectMode={node =>
              highlightNode && node.id === highlightNode.id ? 'before' : 'after'
            }
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
          />
        ) : (
          <div>Search for a term</div>
        )}
      </div>
    </div>
  );
};
