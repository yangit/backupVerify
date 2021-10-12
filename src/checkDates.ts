import fs from 'fs';
import bs58 from 'bs58';
import execa from 'execa';
import os from 'os';
import mkdirp from 'mkdirp';
import moment from 'moment';
import getConfig, { setConfig } from './getConfig';
import { DuplicacyConfigType } from './types';
import sendMessage from './sendMessage';

const userHomeDir = os.homedir();
const dir = `${userHomeDir}/duplicacyDateCheck`;
mkdirp.sync(dir);
const stdin = fs.readFileSync(0).toString(); // STDIN_FILENO = 0
const configIn = JSON.parse(bs58.decode(stdin.replace(/\n/g, '')).toString('utf8'));

const main = async () => {
  setConfig(configIn);
  const { duplicacyConfig } = await getConfig;
  const stdouts = await Promise.all(
    duplicacyConfig.map(async (conf: DuplicacyConfigType) =>
      execa(`${userHomeDir}/.config/bin/duplicacy`, `cat -storage ${conf.name} .date`.split(' ')).catch((err) => err),
    ),
  );
  const now = moment();
  const results = stdouts.map((result, index) => {
    const textDate = result.stdout.split('\n').reverse()[0];
    const diff = moment(new Date(textDate)).diff(now, 'hour');
    return `${duplicacyConfig[index].name}: ${result.failed ? false : diff}`;
  });

  console.log(results);
  await sendMessage(JSON.stringify(results, null, '\t'));
  console.log('All done');
  process.exit(0);
};

main().catch(async (err) => {
  console.log(err);
  await sendMessage('BackupVerify error. Please check logs');
  process.exit(1);
});
