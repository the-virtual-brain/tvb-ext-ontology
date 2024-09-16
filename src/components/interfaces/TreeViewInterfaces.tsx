export interface ITreeNode {
  id: number;
  label: string;
  type: string;
  children: ITreeNode[];
  parents: ITreeNode[];
  requires: string[];
}
