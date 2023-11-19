import env from 'dotenv';
import { MTProto } from '../src/mtproto-client';

const config = env.config().parsed as Record<string, string>;

const mtproto = new MTProto({
  api_id: config.API_ID,
  api_hash: config.API_HASH,
  test: true,
});

main().catch(console.error);
async function main(){
  const res = await mtproto.call('help.getNearestDc');
  console.log(res);
}
