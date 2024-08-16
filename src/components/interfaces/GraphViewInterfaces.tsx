export interface INodeType {
  id: number;
  label: string;
  type: string;
  definition: string;
  iri: string;
  x?: number;
  y?: number;
  collapsed?: boolean;
  childLinks?: ILinkType[];
}

export interface ILinkType {
  source: number;
  target: number;
  type: string;
}
