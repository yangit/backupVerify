import getConfig from '../getConfig';
import runViaSSH, { ExecutorType, RunCommandType } from '../runViaSSH';
import scripts from '../scripts';

export default async (ip: string) => {
  const config = await getConfig;
  const { installDuplicacy, initDuplicacyConfig } = scripts(config);
  const executor: ExecutorType<true> = async (runCommand: RunCommandType) => {
    await runCommand({ failOnExitCode: true, command: installDuplicacy });
    console.log('Duplicacy installed');
    await runCommand({ failOnExitCode: true, command: initDuplicacyConfig });
    console.log('Duplicacy configured');
    return true;
  };

  return runViaSSH({
    ip,
    executor,
  });
};
