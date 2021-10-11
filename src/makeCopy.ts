// import fp from 'lodash/fp';
import moment from 'moment';
import { RunCommandType, ExecutorType } from './runViaSSH';
import getConfig from './getConfig';
import sendMessage from './sendMessage';
import { DuplicacyConfigType } from './types';

const statusToSmallStatus = (report: MakeCopyReturn) => {
  return {
    ...report,
    error: report.error ? { stack: report.error.stack, message: report.error.message.slice(0, 2000) } : null,
  };
};

export interface MakeCopyReturn {
  from?: string;
  to: string;
  allOk: boolean;
  durationSec: number;
  error?: {
    stack: string;
    message: string;
  };
}

const makeCopy = async ({
  runCommand,
  duplicacyConfig,
}: {
  runCommand: RunCommandType;
  duplicacyConfig: DuplicacyConfigType;
}): Promise<MakeCopyReturn> => {
  const { duplicacyBinary, threads } = await getConfig;
  const start = moment();
  const status: MakeCopyReturn = {
    from: duplicacyConfig.copyFrom,
    to: duplicacyConfig.name,
    allOk: false,
    durationSec: 0,
  };
  const { name, id, copyFrom } = duplicacyConfig;

  console.log(`Copy storage from ${copyFrom} to ${name} snapshot ${id}`);

  try {
    await runCommand({
      failOnExitCode: true,
      command: `./${duplicacyBinary} copy -threads ${threads} -from ${copyFrom} -to ${name} -id ${id} | tee ~/duplicacy.log`,
    });
  } catch (error) {
    status.error = { message: `${error}`, stack: error?.stack };
    status.durationSec = moment().diff(start, 'seconds');
    return status;
  }

  console.log(`Storage ${name} copied succesfully from ${copyFrom} snapshot ${id}!`);
  status.durationSec = moment().diff(start, 'seconds');
  status.allOk = true;
  return status;
};

export type MakeCopyExecutorReturnType = Record<string, MakeCopyReturn>;
const checkAllIntegrityExecutor: ExecutorType<Record<string, MakeCopyReturn>> = async (
  runCommand: RunCommandType,
): Promise<MakeCopyExecutorReturnType> => {
  const { duplicacyConfig } = await getConfig;
  const duplicacyConfigs = duplicacyConfig.filter((v) => v.copyFrom);
  const storageStats: Record<string, MakeCopyReturn> = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const duplicacyConfigSingle of duplicacyConfigs) {
    // eslint-disable-next-line no-await-in-loop
    storageStats[duplicacyConfigSingle.name] = await makeCopy({ runCommand, duplicacyConfig: duplicacyConfigSingle });
    if (storageStats[duplicacyConfigSingle.name].error) {
      console.log(`There was an error in ${duplicacyConfigSingle.name} copy!'`);
    }
    console.log('Small report:', JSON.stringify(storageStats[duplicacyConfigSingle.name], null, '\t'));
    // eslint-disable-next-line no-await-in-loop
    await sendMessage(JSON.stringify(statusToSmallStatus(storageStats[duplicacyConfigSingle.name]), null, '\t'));
  }
  return storageStats;
};
export default checkAllIntegrityExecutor;
