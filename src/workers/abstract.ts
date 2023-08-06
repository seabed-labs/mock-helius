export abstract class AbstractWorker {
    enabled: boolean;
    workerPromise: Promise<void>;

    constructor() {
        this.enabled = false;
        this.workerPromise = Promise.resolve();
    }

    abstract onExitError(e: unknown): void;
    abstract onStart(): Promise<void>;
    abstract run(): Promise<void>;
    abstract onStop(): Promise<void>;

    async start(): Promise<void> {
        await this.onStart();
        this.enabled = true;
        this.workerPromise = this.run();
        return this.workerPromise;
    }

    async stop(): Promise<void> {
        await this.onStop();
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
