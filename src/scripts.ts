import { ConfigType } from './types';

export default (config: ConfigType) => {
  const installDuplicacy = `
set -ex
if [ -f "${config.duplicacyBinary}" ]; then
    echo "Duplicacy already downloaded"
else 
    wget https://github.com/gilbertchen/duplicacy/releases/download/v${config.duplicacyVersion}/${config.duplicacyBinary}
    chmod +x ${config.duplicacyBinary}
    mkdir .duplicacy
    ln -s ~/${config.duplicacyBinary} /usr/local/bin/duplicacy
fi
`;
  const initDuplicacyConfig = `
/bin/cat <<EOM >.duplicacy/preferences
${JSON.stringify(config.duplicacyConfig, null, '\t')}
EOM
`;
  return { initDuplicacyConfig, installDuplicacy };
};
