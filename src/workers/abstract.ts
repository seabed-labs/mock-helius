import { injectable } from "inversify";

export abstract class AbstractWorker {
  enabled: boolean;
  private workerPromise: Promise<void>;

  constructor() {
    this.enabled = false;
    this.workerPromise = Promise.resolve();
  }

  abstract run(): Promise<void>;
  abstract onExitError(e: unknown): void;

  async start(): Promise<void> {
    this.enabled = true;
    this.workerPromise = this.run();
    return this.workerPromise;
  }

  async stop(): Promise<void> {
    this.enabled = false;
    try {
      await Promise.race([
        this.workerPromise,
        new Promise((_r, rej) => setTimeout(rej, 600)),
      ]);
    } catch (e) {
      this.onExitError(e);
    }
  }
}
