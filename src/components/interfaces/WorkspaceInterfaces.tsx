import { ISelectedNodeType } from './InfoBoxInterfaces';

export interface IWorkspaceProps {
  workspace: IWorkspaceState;
}

export interface IWorkspaceState {
  model: ISelectedNodeType | null;
  connectivity: ISelectedNodeType | null;
  coupling: ISelectedNodeType | null;
  noise: ISelectedNodeType | null;
  integrationMethod: ISelectedNodeType | null;
}
