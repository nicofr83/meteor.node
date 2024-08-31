
export interface LockINT {
  setGoal(goal: string): void;
  acquire(reason: string, timeout?:number): Promise<boolean>;
  isLocked(): boolean;
  release(): void;
}
