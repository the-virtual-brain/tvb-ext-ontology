export interface ITreeNode {
  id: string;
  label: string;
  type: string;
  children: ITreeNode[];
  parents: ITreeNode[];
}
