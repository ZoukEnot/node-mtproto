import assert from 'node:assert';
import * as net from 'net';
import { DcConfig } from '../dc-config';
import { ObfuscatedTransport } from './obfuscated-transport';

export class Transport extends ObfuscatedTransport {
  dc: DcConfig;
  socket: net.Socket | undefined;
  stream: Uint8Array | undefined;

  constructor(dc: DcConfig) {
    super();

    this.dc = dc;

    this.connect();
  }

  get isAvailable(): boolean {
    assert.ok(this.socket);

    return this.socket.writable;
  }

  connect(): void {
    this.stream = new Uint8Array();

    this.socket = net.connect(
      this.dc.port,
      this.dc.ip,
      this.handleConnect.bind(this)
    );

    this.socket.on('data', this.handleData.bind(this));
    this.socket.on('error', this.handleError.bind(this));
    this.socket.on('close', this.handleClose.bind(this));
  }

  async handleData(data: Buffer): Promise<void> {
    assert.ok(this.stream);

    const bytes = new Uint8Array(data);

    const deobfuscatedBytes = await this.deobfuscate(bytes);

    this.stream = new Uint8Array([...this.stream, ...deobfuscatedBytes]);

    while (this.stream.length >= 8) {
      const dataView = new DataView(this.stream.buffer);
      const payloadLength = dataView.getUint32(0, true);

      if (payloadLength <= this.stream.length - 4) {
        const payload = this.stream.slice(4, payloadLength + 4);

        if (payloadLength === 4) {
          const code = dataView.getInt32(4, true) * -1;

          this.emit('error', {
            type: 'transport',
            code,
          });
        } else {
          this.emit('message', payload.buffer);
        }

        this.stream = this.stream.slice(payloadLength + 4);
      } else {
        break;
      }
    }
  }

  async handleError(error: Error): Promise<void> {
    this.emit('error', { type: 'socket' });
  }

  async handleClose(hadError: boolean): Promise<void> {
    assert.ok(this.socket);

    if (!this.socket.destroyed) {
      this.socket.destroy();
    }

    this.connect();
  }

  async handleConnect(): Promise<void> {
    assert.ok(this.socket);

    const initialMessage = await this.generateObfuscationKeys();

    this.socket.write(initialMessage);

    this.emit('open');
  }

  async send(bytes: Uint8Array): Promise<void> {
    assert.ok(this.socket);

    const intermediateBytes = this.getIntermediateBytes(bytes);
    const obfuscatedBytes = await this.obfuscate(intermediateBytes);

    this.socket.write(obfuscatedBytes);
  }
}
