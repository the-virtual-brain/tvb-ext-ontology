import React, { useEffect, useState } from 'react';
import '../style/layout.css';
import { OntologyWidgetComponent } from './OntologyWidget';
import TreeViewComponent from './components/TreeView';
import SeachBarComponent from './components/SearchBar';
import InfoBoxComponent from './components/InfoBox';
import WorkspaceComponent from './components/Workspace';

interface IAppProps {
  fetchData: () => Promise<any>;
}

const App: React.FC<IAppProps> = ({ fetchData }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        const result = await fetchData();
        setData(result);
        console.log(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchAndSetData();
  }, [fetchData]);

  return (
    <div className="layout">
      <SeachBarComponent />
      <TreeViewComponent />
      <InfoBoxComponent />
      <WorkspaceComponent />
      <OntologyWidgetComponent fetchData={fetchData} />
    </div>
  );
};
export default App;
