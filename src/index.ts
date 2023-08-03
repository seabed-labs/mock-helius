import 'reflect-metadata';
import { iocContainer } from './ioC';
import { TYPES } from './ioCTypes';
import { IWorker } from './workers';

async function exitHandler(signal: string, worker: IWorker) {
    console.log(`exiting worker ${worker.name} from signal ${signal}`);
    await worker.stop();
    process.exit(0);
}

async function main() {
    const container = iocContainer;
    const workers = container.getAll<IWorker>(TYPES.IWorker);
    process.on('SIGINT', async () => {
        await Promise.all(
            workers.map((worker) => exitHandler('SIGINT', worker))
        );
    });
    process.on('SIGTERM', async () => {
        await Promise.all(
            workers.map((worker) => exitHandler('SIGTERM', worker))
        );
    });
    return Promise.all(workers.map((worker) => worker.start()));
}

main()
    .then(() => console.log('done'))
    .catch((e) => console.log('error while running mock helius', e));
