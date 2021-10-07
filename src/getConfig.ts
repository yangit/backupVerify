import storagesAndSnapshotsToDuplicacyConfig from './storagesAndSnapshotsToDuplicacyConfig';

export interface ConfigRawType {
  duplicacyBinary: string;
  sshPrivateKey: string;
  sshPublicKey: string;
  linodeToken: string;
  instance: {
    root_pass: string;
    region: string;
    label: string;
    tags: string[];
    type: string;
    image: string;
  };
  storagesAndSnapshots: {
    storage: string;
    keys: {
      dropbox_token: string;
      password: string;
    };
    snapshots: string[];
  }[];
}

export interface ConfigType extends ConfigRawType {
  duplicacyConfig: {
    name: string;
    id: string;
    storage: string;
    keys: {
      dropbox_token: string;
      password: string;
    };
    repository: string;
    encrypted: boolean;
    no_backup: boolean;
    no_restore: boolean;
    no_save_password: boolean;
    nobackup_file: string;
    filters: string;
    exclude_by_attribute: boolean;
  }[];
}

let resolve: (config: ConfigType) => void;

export default new Promise<ConfigType>((resolveLocal) => {
  resolve = resolveLocal;
}).then((config) => {
  console.log('Got config, starting!');
  return config;
});
export const setConfig = (configRaw: ConfigRawType) => {
  const { storagesAndSnapshots, ...rest } = configRaw;
  resolve({
    ...rest,
    duplicacyConfig: storagesAndSnapshotsToDuplicacyConfig(storagesAndSnapshots),
    storagesAndSnapshots,
  });
};
