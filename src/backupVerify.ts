import './init';
import bs58 from 'bs58';
import fs from 'fs';
import fp from 'lodash/fp';
import instanceManager from './instanceManager';
import { setConfig } from './getConfig';
import runViaSSH from './runViaSSH';
import sendMessage from './sendMessage';
import integrityCheckExecutor from './integrityCheck';

const stdin = fs.readFileSync(0).toString(); // STDIN_FILENO = 0
const configIn = JSON.parse(bs58.decode(stdin.replace(/\n/g, '')).toString('utf8'));

const main = async () => {
  setConfig(configIn);
  const manager = instanceManager('integrity');
  await sendMessage(
    `\nStarting backup verify:\n${new Date()}\n${JSON.stringify(
      configIn.storagesAndSnapshots.map(fp.pick(['storage', 'snapshots'])),
      null,
      '\t',
    )}`,
  );
  const ip = await manager.up();
  console.log('Instance IP is', ip);

  const reports = await runViaSSH({
    ip,
    executor: integrityCheckExecutor,
  });
  // await sendMessage(`\n${JSON.stringify(reports, null, '\t')}`);
  console.log('Full report', JSON.stringify(reports, null, '\t'));
  await manager.down();
  const message = 'Backup verification done';
  await sendMessage(message);
  console.log(message);
  process.exit(0);
};

main().catch(async (err) => {
  console.log(err);
  await sendMessage('BackupVerify error. Please check logs');
  process.exit(1);
});
