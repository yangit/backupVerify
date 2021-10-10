import fs from 'fs';
import storagesAndSnapshotsToDuplicacyConfig from './storagesAndSnapshotsToDuplicacyConfig';
import { ConfigRawType, DuplicacyConfigType } from './types';

const stdin = fs.readFileSync(0).toString('utf8'); // STDIN_FILENO = 0
const configIn: ConfigRawType = JSON.parse(stdin);
console.log(
  JSON.stringify(
    storagesAndSnapshotsToDuplicacyConfig(configIn).map((conf: DuplicacyConfigType) => {
      const {
        name,
        id,
        storage,
        keys: { password, b2_id, b2_key, dropbox_token },
      } = conf;
      const envVars: string[] = [];
      if (b2_id) {
        envVars.push(`DUPLICACY_${name.toUpperCase()}_B2_ID=${b2_id}`);
      }
      if (b2_key) {
        envVars.push(`DUPLICACY_${name.toUpperCase()}_B2_KEY=${b2_key}`);
      }
      if (dropbox_token) {
        envVars.push(`DUPLICACY_${name.toUpperCase()}_DROPBOX_TOKEN=${dropbox_token}`);
      }
      if (password) {
        envVars.push(`DUPLICACY_${name.toUpperCase()}_PASSWORD=${password}`);
      }
      return {
        ...conf,
        initCommand: `${envVars.join(
          ' ',
        )} duplicacy init -encrypt -storage-name ${name} -repository ~/duplicacyRestore/dummyInit -pref-dir ~/duplicacyRestore ${id} ${storage}`,
      };
    }),
    null,
    '\t',
  ),
);
