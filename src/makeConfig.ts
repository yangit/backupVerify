import fs from 'fs';
import storagesAndSnapshotsToDuplicacyConfig from './storagesAndSnapshotsToDuplicacyConfig';
import { ConfigRawType } from './types';

const stdin = fs.readFileSync(0).toString('utf8'); // STDIN_FILENO = 0
const configIn: ConfigRawType = JSON.parse(stdin);
console.log(JSON.stringify(storagesAndSnapshotsToDuplicacyConfig(configIn), null, '\t'));
