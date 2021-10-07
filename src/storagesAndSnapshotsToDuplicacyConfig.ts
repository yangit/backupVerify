import fp from 'lodash/fp';

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
  no_backup: true,
  no_restore: false,
  no_save_password: false,
  nobackup_file: '',
  filters: '',
  exclude_by_attribute: false,
};

export default fp.flow([
  fp.flatMap(({ snapshots, storage, ...rest }) =>
    snapshots.map((snapshot: string) => ({
      ...defaultConfig,
      ...rest,
      id: snapshot,
      storage,
      name: `${storage}/${snapshot}`.replace(/[^a-zA-Z\d]/g, '_'),
    })),
  ),
]);
