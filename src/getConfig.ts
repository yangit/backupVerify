import storagesAndSnapshotsToDuplicacyConfig from './storagesAndSnapshotsToDuplicacyConfig';
import { ConfigRawType, ConfigType } from './types';

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
    duplicacyConfig: storagesAndSnapshotsToDuplicacyConfig(configRaw),
    storagesAndSnapshots,
  });
};
