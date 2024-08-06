import React, { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { ReactWidget } from '@jupyterlab/apputils';

interface IOntologyWidgetProps {
  fetchData: () => Promise<any>;
}

export const OntologyWidgetComponent: React.FC<IOntologyWidgetProps> = ({
  fetchData
}) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        const result = await fetchData();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchAndSetData();
  }, [fetchData]);

  return (
    <div className="ontologyGraph">
      {data ? (
        <ForceGraph2D
          graphData={data}
          // nodeLabel="label"
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
  );
};

export class OntologyWidget extends ReactWidget {
  fetchData: () => Promise<any>;

  constructor(fetchData: () => Promise<any>) {
    super();
    this.addClass('tvb-OntologyWidget');
    this.fetchData = fetchData;
  }

  render(): React.ReactElement {
    return <OntologyWidgetComponent fetchData={this.fetchData} />;
  }
}
