import { Client as SSHClient } from 'ssh2';
import moment from 'moment';
import getConfig from './getConfig';

const getRunCommand = ({ client, onUpdate: onUpdateGlobal }: { client: SSHClient; onUpdate: OnUpdateType }) => async ({
  command,
  failOnExitCode = true,
  onUpdate: onUpdateLocal,
}: RunCommandParams): RunCommandReturn =>
  new Promise((resolve, reject) => {
    const onUpdate = onUpdateLocal || onUpdateGlobal;
    const start = moment();
    const result = { exitCode: -1, stdout: '', stderr: '', command, durationSec: 0 };
    client.exec(command, (err: any, stream: any): void => {
      if (err) {
        reject(err);

        return;
      }

      stream
        .on('close', (code: number): void => {
          result.durationSec = moment().diff(start, 'seconds');
          if (code !== 0 && failOnExitCode) {
            reject(
              new Error(
                `SSH command failed with exit code ${code}:\n${command}\n${JSON.stringify(result, null, '\t')}`,
              ),
            );
            return;
          }
          result.exitCode = code;
          resolve(result);
        })
        .on('data', (string: string) => {
          onUpdate(string.toString());
          result.stdout += string.toString();
        })
        .on('error', reject)
        .stderr.on('data', (string: string) => {
          onUpdate(string.toString());
          result.stderr += string.toString();
        });
    });
  });

export type OnUpdateType = (str: string | Buffer) => void;

export type RunCommandReturn = Promise<RunCommandReturnRaw>;
export type RunCommandReturnRaw = { stdout: string; stderr: string; exitCode: number; durationSec: number };
export type RunCommandParams = {
  command: string;
  failOnExitCode: boolean;
  onUpdate?: OnUpdateType;
};
export type RunCommandType = (params: RunCommandParams) => RunCommandReturn;

export type ExecutorType<T> = (runCommand: RunCommandType) => Promise<T>;

const runViaSSH = async <T>({
  ip,
  executor,
  onUpdate = () => {},
}: {
  ip: string;
  onUpdate?: OnUpdateType;
  executor: ExecutorType<T>;
}): Promise<T> => {
  const { sshPrivateKey } = await getConfig;
  return new Promise((resolve, reject) => {
    const client = new SSHClient();
    client.on('error', reject);
    client
      .on('ready', () => {
        executor(getRunCommand({ client, onUpdate })).then(resolve, reject);
      })
      .on('error', reject)
      .connect({
        host: ip,
        port: 22,
        username: 'root',
        privateKey: sshPrivateKey,
      });
  });
};
export default runViaSSH;
