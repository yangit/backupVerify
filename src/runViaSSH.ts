import { Client as SSHClient } from 'ssh2';
import moment from 'moment';
import fs from 'fs';
import getConfig from './getConfig';

const getRunCommand =
  ({ client, onUpdate: onUpdateGlobal, logFile }: { client: SSHClient; onUpdate: OnUpdateType; logFile?: string }) =>
  async ({
    command,
    failOnExitCode = true,
    failOnStdErr = true,
    onUpdate: onUpdateLocal,
  }: RunCommandParams): RunCommandReturn =>
    new Promise((resolve, reject) => {
      let logStream: fs.WriteStream | undefined;

      const onUpdate = onUpdateLocal || onUpdateGlobal;
      const start = moment();
      const result = {
        exitCode: -1,
        stdout: '',
        stderr: '',
        stdMix: `CMD: ${new Date().toISOString()}: ${command}\n`,
        command,
        durationSec: 0,
      };
      if (logFile) {
        logStream = fs.createWriteStream(logFile, { flags: 'a' });
        logStream?.write(result.stdMix);
      }
      client.exec(command, (err: any, stream: any): void => {
        if (err) {
          reject(err);

          return;
        }

        stream
          .on('close', (code: number): void => {
            result.durationSec = moment().diff(start, 'seconds');
            logStream?.end();
            if (code !== 0 && failOnExitCode) {
              const errLocal = new Error(
                `runCommand failed beacuse exit code ${code}:\n${command}\n${JSON.stringify(result, null, '\t')}`,
              );
              Object.assign(errLocal, result);
              reject(errLocal);
              return;
            }
            if (failOnStdErr && result.stderr.length) {
              const errLocal = new Error(
                `runCommand failed beacuse STDERR:\n${command}\n${JSON.stringify(result, null, '\t')}`,
              );
              Object.assign(errLocal, result);
              reject(errLocal);
              return;
            }
            result.exitCode = code;
            resolve(result);
          })
          .on('data', (string: string) => {
            onUpdate(string.toString());
            result.stdout += string.toString();
            const logFileLine = `STDOUT: ${new Date().toISOString()}: ${string.toString()}`;
            result.stdMix += logFileLine;
            logStream?.write(logFileLine);
          })
          .on('error', reject)
          .stderr.on('data', (string: string) => {
            onUpdate(string.toString());
            result.stderr += string.toString();
            const logFileLine = `STDERR: ${new Date().toISOString()}: ${string.toString()}`;
            result.stdMix += logFileLine;
            logStream?.write(logFileLine);
          });
      });
    });

export type OnUpdateType = (str: string | Buffer) => void;

export type RunCommandReturn = Promise<RunCommandReturnRaw>;
export type RunCommandReturnRaw = {
  stdout: string;
  stderr: string;
  stdMix: string;
  exitCode: number;
  durationSec: number;
};
export type RunCommandParams = {
  command: string;
  failOnExitCode: boolean;
  failOnStdErr: boolean;
  onUpdate?: OnUpdateType;
};
export type RunCommandType = (params: RunCommandParams) => RunCommandReturn;

export type ExecutorType<T> = (runCommand: RunCommandType) => Promise<T>;

const runViaSSH = async <T>({
  ip,
  executor,
  logFile,
  onUpdate = () => {},
}: {
  ip: string;
  logFile?: string;
  onUpdate?: OnUpdateType;
  executor: ExecutorType<T>;
}): Promise<T> => {
  const { sshPrivateKey } = await getConfig;
  if (logFile) {
    console.log(`given logfile:${logFile} truncating it`);
    fs.closeSync(fs.openSync(logFile, 'w'));
  }
  return new Promise((resolve, reject) => {
    const client = new SSHClient();
    client.on('error', reject);
    client
      .on('ready', () => {
        executor(getRunCommand({ client, onUpdate, logFile })).then(resolve, reject);
      })
      .on('error', reject)
      .on('timeout', (event: any) => {
        console.log('If you See THIS the SSH connection TIMEEDOUT and there is no handler for it YAN!', event);
      })
      // .on('end', (event: any) => {
      //   console.log('If you See THIS the SSH connection ENDED and there is no handler for it YAN!', event);
      // })
      .connect({
        host: ip,
        port: 22,
        username: 'root',
        privateKey: sshPrivateKey,
        keepaliveInterval: 10 * 1000,
      });
  });
};
export default runViaSSH;
