export interface ConfigRawType {
  repositoryBase: string;
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
    copyFrom?: string;
    snapshots: string[];
  }[];
}

export interface ConfigType extends ConfigRawType {
  duplicacyConfig: DuplicacyConfigType[];
}

export interface DuplicacyConfigType {
  name: string;
  id: string;
  storage: string;
  copyFrom?: string;
  addCopyCommand?: string;
  keys: {
    b2_id?: string;
    b2_key?: string;
    dropbox_token?: string;
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
}
