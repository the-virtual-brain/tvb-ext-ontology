import { ILinkType, INodeType } from './GraphViewInterfaces';

export interface ISelectedNodeType {
  id: number;
  label: string;
  type: string;
  definition: string;
  iri: string;
  requires: string[];
  childNodes?: INodeType[];
  childLinks?: ILinkType[];
  collapsed?: boolean;
}
