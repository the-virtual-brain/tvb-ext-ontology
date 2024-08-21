import { ILinkType } from './GraphViewInterfaces';

export interface ISelectedNodeType {
  label: string;
  type: string;
  definition: string;
  iri: string;
  childLinks?: ILinkType[],
  collapsed?: boolean;
}
