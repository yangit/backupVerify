import fp from 'lodash/fp';
import { ConfigRawType, DuplicacyConfigType } from './types';

// EXAMPLE
// const storagesAndSnapshots = [
//     {
//         storage: 'dropbox://mini',
//         keys: {
//             dropbox_token: '',
//             password: '',
//         },
//         snapshots: ['testDuplicacyContents', 'yFolder'],
//     },
//     ...
// ];

// EXAMPLE
const defaultConfig = {
  // name: 'restoreDropbox',
  // id: 'testDuplicacyContents',
  // storage: 'dropbox://mini',
  // keys: {
  //   dropbox_token: '',
  //   password: '',
  // },
  repository: '',
  encrypted: true,
  no_backup: false,
  no_restore: false,
  no_save_password: false,
  nobackup_file: '',
  filters: '',
  exclude_by_attribute: false,
};

export default (rawConfig: ConfigRawType): DuplicacyConfigType[] => {
  const { storagesAndSnapshots, repositoryBase } = rawConfig;
  return fp.flow([
    fp.flatMap(({ snapshots, storage, ...rest }) =>
      snapshots.map((snapshot: string) => {
        const name = `${storage}/${snapshot}`.replace(/[^a-zA-Z\d]/g, '_');
        return {
          ...defaultConfig,
          ...rest,
          id: snapshot,
          storage,
          name,
          repository: `${repositoryBase}/${name}`,
        };
      }),
    ),
  ])(storagesAndSnapshots);
};
