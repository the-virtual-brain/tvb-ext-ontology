export interface INodeType {
  id: string;
  label: string;
  type: string;
  definition: string;
  iri: string;
  x?: number;
  y?: number;
  collapsed?: boolean;
  childNodes?: INodeType[];
  childLinks?: ILinkType[];
}

export interface ILinkType {
  source: string;
  target: string;
  type: string;
}
