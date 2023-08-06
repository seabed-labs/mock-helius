export interface IWorker {
    name: string;
    start(): Promise<void>;
    stop(): Promise<void>;
}
