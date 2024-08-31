import 'reflect-metadata';
import { Service } from 'typedi';
import * as EventObj from "events";
import { LockINT } from "./lock_interface";
const EventEmitter = EventObj.EventEmitter;

@Service({ transient: true })
export class Lock implements LockINT {
  private myLock: boolean;
  private lockGoal: string;
  private reasonLocked: string;
  private eventEmitter: any;
  constructor() {
    this.myLock = false;
    this.eventEmitter = new EventEmitter();
    this.reasonLocked = '';
    this.lockGoal = '';
  }

  public setGoal(goal: string): void {
    this.lockGoal = goal;
  }
  public async acquire(reason: string, timeout = 500): Promise<boolean> {
    return new Promise<boolean>((f, reject) => {
      try {
        // If nobody has the lock, take it and resolve immediately
        if (!this.myLock) {
          // Safe because JS doesn't interrupt you on synchronous operations,
          // so no need for compare-and-swap or anything like that.
          this.myLock = true;
          this.reasonLocked = reason;
          return f(true);
        }
        const myTimeOut = setTimeout(() => {
          this.eventEmitter.removeListener("release", tryAcquire);
          console.warn("lock timeout(" + this.lockGoal + "), locked for " + this.reasonLocked + ", new lock for " + reason);
        //   this.myLock = true;
        //   console.log("lock " + this.lockGoal + " aquired by brute force for " + reason);
        //   this.reasonLocked = reason;
          return f(false);
        }, timeout);

        // Otherwise, wait until somebody releases the lock and try again
        const tryAcquire = () => {
          if (!this.myLock) {
            clearTimeout(myTimeOut);
            this.eventEmitter.removeListener("release", tryAcquire);
            this.myLock = true;
            this.reasonLocked = reason;
            return f(true);
          }
        };
        this.eventEmitter.on("release", tryAcquire);
      } catch {
        return false;
      }
    });
  }
  public isLocked(): boolean {
    return this.myLock;
  }
  public release(): void {
    // Release the lock immediately
    this.myLock = false;
    this.reasonLocked = "";
    setImmediate(() => this.eventEmitter.emit("release"));
  }
}
