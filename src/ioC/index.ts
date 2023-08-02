// eslint-disable-next-line import/order
import dotenv from "dotenv";
dotenv.config();

import { Container } from "inversify";
import { buildProviderModule } from "inversify-binding-decorators";
import { TYPES } from "../ioCTypes";
import { IConfig, Config } from "../config";
import { Connection, IConnection } from "../rpcConnection";
import { AccountWorker, IWorker, TransactionWorker } from "../workers";

const iocContainer = new Container({ skipBaseClassChecks: true });
// make inversify aware of inversify-binding-decorators
iocContainer.load(buildProviderModule());

iocContainer.bind<IConfig>(TYPES.IConfig).to(Config).inSingletonScope();
iocContainer
  .bind<IConnection>(TYPES.IConnection)
  .to(Connection)
  .inSingletonScope();
iocContainer.bind<IWorker>(TYPES.IWorker).to(AccountWorker);
iocContainer.bind<IWorker>(TYPES.IWorker).to(TransactionWorker);

export { iocContainer };
