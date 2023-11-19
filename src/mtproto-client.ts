import EventEmitter from 'node:events';
import { RPC } from './rpc';
import { InMemoryCache } from './utils';
import { PRODUCTION_DC_LIST, TEST_DC_LIST } from './dc-list';
import { Transport } from './transport/transport';

interface Options {
  api_id: string;
  api_hash: string;
  test?: boolean;
}

export class MTProto {
  private api_id: string;
  private api_hash: string;
  private initConnectionParams: any;
  private dcList: any[];
  private rpcs: Map<any, any>;
  private storage: InMemoryCache;
  private updates: EventEmitter;

  constructor(options: Options) {
    const { api_id, api_hash } = options;

    this.api_id = api_id;
    this.api_hash = api_hash;

    this.initConnectionParams = {};

    this.dcList = options.test ? TEST_DC_LIST : PRODUCTION_DC_LIST;

    this.rpcs = new Map<any, any>();
    this.storage = new InMemoryCache();
    this.updates = new EventEmitter();
  }

  async call(method: string, params: any = {}, options: any = {}): Promise<any> {
    const { syncAuth = true } = options;

    const dcId: string | number = options.dcId || (await this.storage.get('defaultDcId')) || 2;

    const rpc = this.getRPC(dcId);

    const result = await rpc.call(method, params);

    if (syncAuth && result._ === 'auth.authorization') {
      await this.syncAuth(dcId);
    }

    return result;
  }

  syncAuth(dcId: string | number): Promise<void[]> {
    const promises: Promise<void>[] = [];

    this.dcList.forEach((dc) => {
      if (dcId === dc.id) {
        return;
      }

      const promise = this.call(
        'auth.exportAuthorization',
        { dc_id: dc.id },
        { dcId }
      )
        .then((result) => {
          return this.call(
            'auth.importAuthorization',
            {
              id: result.id,
              bytes: result.bytes,
            },
            { dcId: dc.id, syncAuth: false }
          );
        })
        .catch((error) => {
          console.error(`error when copy auth to DC ${dc.id}`, error);
          return Promise.resolve();
        });

      promises.push(promise);
    });

    return Promise.all(promises);
  }

  setDefaultDc(dcId: string | number): void {
    return this.storage.set('defaultDcId', dcId);
  }

  getRPC(dcId: string | number): RPC {
    if (this.rpcs.has(dcId)) {
      return this.rpcs.get(dcId);
    }

    const dc = this.dcList.find(({ id }) => id === dcId);

    if (!dc) {
      throw new Error(`DC with id ${dcId} not found`);
    }

    const transport = new Transport(dc);

    const rpc = new RPC({
      dc,
      context: this,
      transport,
    });

    this.rpcs.set(dcId, rpc);

    return rpc;
  }

  updateInitConnectionParams(params: any): void {
    this.initConnectionParams = params;
  }
}
