import { ConfigType } from './getConfig';

export default (config: ConfigType) => {
  const installDuplicacy = `
set -ex
if [ -f "${config.duplicacyBinary}" ]; then
    echo "Duplicacy already downloaded"
else 
    wget https://github.com/gilbertchen/duplicacy/releases/download/v2.7.1/${config.duplicacyBinary}
    chmod +x ${config.duplicacyBinary}
    mkdir .duplicacy
fi
`;
  const initDuplicacyConfig = `
/bin/cat <<EOM >.duplicacy/preferences
${JSON.stringify(config.duplicacyConfig, null, '\t')}
EOM
`;
  return { initDuplicacyConfig, installDuplicacy };
};
