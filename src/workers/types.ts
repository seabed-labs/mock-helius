export interface IWorker {
    get name(): string;
    start(): Promise<void>;
    stop(): Promise<void>;
}
