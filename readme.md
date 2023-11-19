# Overview

Node.js telegram client. Typescript port of [mtproto-core](https://github.com/alik0211/mtproto-core).

# Usage
1. Add `.env` file to the root directory with content from https://my.telegram.org/apps
```conf
API_ID=<insert_api_id>
API_HASH="<insert_api_hash>"
```
2. Run `npm install`
3. Run demo `npm run demo`

## License

GPLv3

# TODO

### [rpc.ts](./src/rpc.ts)
- refactor, into small files
- handshake sequence should be declarative

### [rsa.ts](./src/crypto/rsa.ts)
- Refactor out public keys configuration.

### [obfuscated-transport.ts](./src/transport/obfuscated-transport.ts)
Refactor and fix types. Consider merging with [transport](./src/transport/transport.ts).

### [aes.ts](./src/crypto/aes.ts)
[aes.ts](./src/crypto/aes.ts) uses internals of aes-js
- add types `npm i -D @types/aes-js`
- try to fix aes.ts
- if functionality breaks, try to pin aes-js to v3.1.2

### leemon
[leemon](https://github.com/zerobias/leemon#readme) is no longer supported, lates commit 5 years ago and only has 26 stars on github.

This dependency should be removed.

Used from
- [pq.ts](./src/crypto/pq.ts)


### [parser.ts](./src/tl/parser.ts.ts)
Check autogeneration, add remote source

### [builder.ts](./src/tl/builder.ts)
Check autogeneration, add remote source

### minor issues

- fix type issue in [deserializer.ts](./src/tl/deserializer.ts) `gzip` function
- do not use async promise executor in [rpc::call](./src/rpc.ts)

