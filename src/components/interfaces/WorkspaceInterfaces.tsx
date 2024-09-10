import { ISelectedNodeType } from './InfoBoxInterfaces';

export interface IWorkspaceProps {
  workspace: IWorkspaceState;
  updateConnectivityOptions: (optionType: 'parcellation' | 'tractogram', value: string) => void;
}

export interface IWorkspaceState {
  model: ISelectedNodeType | null;
  parcellation: string | null;
  tractogram: string | null;
  coupling: ISelectedNodeType | null;
  noise: ISelectedNodeType | null;
  integrationMethod: ISelectedNodeType | null;
}
