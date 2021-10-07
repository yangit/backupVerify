import './init';
import fs from 'fs';
import instanceManager from './instanceManager';
import { setConfig } from './getConfig';
import runViaSSH from './runViaSSH';
import sendMessage from './sendMessage';
import integrityCheckExecutor from './integrityCheck';

const stdin = fs.readFileSync(0).toString(); // STDIN_FILENO = 0
const configIn = JSON.parse(stdin);

const main = async () => {
  try {
    setConfig(configIn);
    const manager = instanceManager('integrity');
    const ip = await manager.up();
    console.log('Instance IP is', ip);

    const reports = await runViaSSH({
      ip,
      executor: integrityCheckExecutor,
    });
    await sendMessage(JSON.stringify(reports, null, '\t'));
    await manager.down();
    console.log(222);
    process.exit();
  } catch (err) {
    console.log(err);
    sendMessage(err?.message);
    sendMessage(err?.stack);
  }
};
main();
