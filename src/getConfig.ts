import storagesAndSnapshotsToDuplicacyConfig from './storagesAndSnapshotsToDuplicacyConfig';
import { ConfigRawType, ConfigType } from './types';

let resolve: (config: ConfigType) => void;

export default new Promise<ConfigType>((resolveLocal) => {
  resolve = resolveLocal;
}).then((config) => {
  console.log(`${new Date().toISOString()}: Got config, starting!`);
  return config;
});
export const setConfig = (configRaw: ConfigRawType) => {
  const { storagesAndSnapshots, duplicacyBinary, ...rest } = configRaw;
  resolve({
    ...rest,
    duplicacyBinary,
    duplicacyConfig: storagesAndSnapshotsToDuplicacyConfig(configRaw),
    duplicacyVersion: duplicacyBinary.split('_').reverse()[0],
    storagesAndSnapshots,
  });
};
