type AutomationType = 'robot' | 'flow' | 'application';
type Status = 'active' | 'deleted' | 'inactive';

export interface Automation {
  id: string;
  name: string;
  type: AutomationType;
  creationTime: Date;
  status: Status;
}
