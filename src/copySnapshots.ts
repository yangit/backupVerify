import './init';
import bs58 from 'bs58';
import fs from 'fs';
import fp from 'lodash/fp';
import instanceManager from './instanceManager';
import { setConfig } from './getConfig';
import runViaSSH from './runViaSSH';
import sendMessage from './sendMessage';
import makeCopy from './makeCopy';
import { ConfigRawType, StorageAndSnapshot } from './types';

const main = async (configIn: ConfigRawType) => {
  setConfig(configIn);
  const manager = instanceManager('copy');
  await sendMessage(
    `\nStarting backup copy:\n${new Date()}\n${JSON.stringify(
      configIn.storagesAndSnapshots
        .filter((v: StorageAndSnapshot) => v.copyFrom)
        .map(fp.pick(['storage', 'snapshots', 'copyFrom'])),
      null,
      '\t',
    )}`,
  );
  const ip = await manager.up();
  console.log('Instance IP is', ip);
  const reports = await runViaSSH({
    ip,
    executor: makeCopy,
  });
  // await sendMessage(`\n${JSON.stringify(reports, null, '\t')}`);
  console.log('Full report', JSON.stringify(reports, null, '\t'));
  await manager.down();
  await sendMessage('All done');
  console.log('All done');
  process.exit(0);
};

const stdin = fs.readFileSync(0).toString(); // STDIN_FILENO = 0
const maybeJson = bs58.decode(stdin.replace(/\n/g, '')).toString('utf8');
try {
  const configIn = JSON.parse(maybeJson);
  main(configIn).catch(async (err) => {
    console.log(err);
    await sendMessage('Backup copy error. Please check logs');
    process.exit(1);
  });
} catch (err) {
  console.log('could not parse JSON', maybeJson);
  process.exit(1);
}
