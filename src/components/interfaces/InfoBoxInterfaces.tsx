import { ILinkType, INodeType } from './GraphViewInterfaces';

export interface ISelectedNodeType {
  label: string;
  type: string;
  definition: string;
  iri: string;
  childNodes?: INodeType[];
  childLinks?: ILinkType[];
  collapsed?: boolean;
}
