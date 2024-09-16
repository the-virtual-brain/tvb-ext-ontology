export interface INodeType {
  id: number;
  label: string;
  type: string;
  definition: string;
  iri: string;
  requires: string[];
  x?: number;
  y?: number;
  collapsed?: boolean;
  childNodes?: INodeType[];
  childLinks?: ILinkType[];
}

export interface ILinkType {
  source: number;
  target: number;
  type: string;
}
