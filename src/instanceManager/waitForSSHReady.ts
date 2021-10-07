import runViaSSH, { RunCommandType } from '../runViaSSH';

export default async (ip: string) => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (
      // eslint-disable-next-line no-await-in-loop
      await runViaSSH({
        ip,
        executor: (runCommand: RunCommandType) => runCommand({ command: 'echo 1', failOnExitCode: true }),
      }).then(
        () => true,
        () => false,
      )
    ) {
      break;
    }
    console.log('SSH is not ready yet...');
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return true;
};
