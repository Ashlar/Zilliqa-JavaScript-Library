import Mitt, { Emitter } from 'mitt';
import BaseProvider from './base';
import { RPCMethod, RPCRequest, RPCRequestPayload, RPCResponse, performRPC } from '../net';
import { composeMiddleware, ReqMiddlewareFn, ResMiddlewareFn } from '../util';
import { Provider, Subscriber, Subscribers } from '../types';

export default class HTTPProvider extends BaseProvider implements Provider {
  buildPayload<T extends any[]>(method: RPCMethod, params: T): RPCRequest<T> {
    return {
      url: this.nodeURL,
      payload: { id: 1, jsonrpc: '2.0', method, params },
    };
  }

  send<P extends any[], R = any, E = string>(
    method: RPCMethod,
    ...params: P
  ): Promise<RPCResponse<R, E>> {
    const [tReq, tRes] = this.getMiddleware(method);
    const reqMiddleware = composeMiddleware(...tReq);
    const resMiddleware = composeMiddleware(...tRes);

    const req = reqMiddleware(this.buildPayload(method, params));

    return performRPC(req, resMiddleware);
  }

  subscribe(event: string, subscriber: Subscriber): Symbol {
    throw new Error('HTTPProvider does not support subscriptions.');
  }

  unsubscribe(token: symbol) {
    throw new Error('HTTPProvider does not support subscriptions.');
  }
}
