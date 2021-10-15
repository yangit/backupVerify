import fp from 'lodash/fp';
import moment from 'moment';
import { RunCommandType, ExecutorType } from './runViaSSH';
import * as parser from './duplicacyOutputParser';
import getConfig from './getConfig';
import sendMessage from './sendMessage';
import { IntegrityCheckReturn } from './types';
import statusToSmallStatus from './statusToSmallStatus';

const integrityCheck = async ({
  runCommand,
  storage,
}: {
  runCommand: RunCommandType;
  storage: string;
}): Promise<IntegrityCheckReturn> => {
  const { duplicacyBinary, threads } = await getConfig;
  const start = moment();
  const status: IntegrityCheckReturn = {
    storage,
    allOk: false,
    listOk: false,
    quickCheckOk: false,
    filesOk: false,
    chunksOk: false,
    pruningOk: false,
    durationSec: 0,
  };

  console.log(`Deep checking storage: ${storage}`);

  try {
    ({ revisions: status.revisions } = parser.list(
      await runCommand({
        failOnExitCode: true,
        failOnStdErr: true,
        command: `./${duplicacyBinary} list -storage ${storage}`,
      }),
    ));
    status.revisionCount = status.revisions.length;
  } catch (error) {
    status.error = { message: `${error}`, stack: error?.stack };
    status.durationSec = moment().diff(start, 'seconds');
    return status;
  }

  try {
    console.log(`Revisions count: ${JSON.stringify(status.revisions.length)}`);
    status.lastRevision = fp.last(status.revisions);
    if (!status.lastRevision) {
      throw new Error('lastRevision is not found');
    }
  } catch (error) {
    status.error = { message: `${error}`, stack: error?.stack };
    status.durationSec = moment().diff(start, 'seconds');
    return status;
  }

  try {
    console.log(`Last revision: ${JSON.stringify(status.lastRevision)}`);
    ({ files: status.files } = parser.listFiles(
      await runCommand({
        failOnExitCode: true,
        failOnStdErr: true,
        command: `./${duplicacyBinary} list -storage ${storage} -r ${status.lastRevision.number} -files`,
      }),
    ));
    status.listOk = true;
    console.log(`Files: ${JSON.stringify(status.files)}`);
  } catch (error) {
    status.error = { message: `${error}`, stack: error?.stack };
    status.durationSec = moment().diff(start, 'seconds');
    return status;
  }

  try {
    console.log('Starting pruning');
    const { durationSec: pruningDuration } = await runCommand({
      failOnExitCode: true,
      failOnStdErr: true,
      command: `./${duplicacyBinary} prune -storage ${storage} -keep 0:360 -keep 30:180 -keep 7:30 -keep 1:7 -threads ${threads}`,
    });

    status.pruningOk = true;

    console.log(`Storage pruned successfully in ${pruningDuration}s`);
  } catch (error) {
    status.error = { message: `${error}`, stack: error?.stack };
    status.durationSec = moment().diff(start, 'seconds');
    return status;
  }

  try {
    console.log('Starting quick check');
    const { checkedRevisions, durationSec: durationQuickCheck } = parser.checkQuick(
      await runCommand({
        failOnExitCode: true,
        failOnStdErr: true,
        command: `./${duplicacyBinary} check -storage ${storage} -threads ${threads}`,
      }),
    );

    parser.compareCheckedRevisions({ checked: checkedRevisions, all: status.revisions.map(({ number }) => number) });

    status.quickCheckOk = true;
    console.log(`QuickCheck done in ${durationQuickCheck}s`);
  } catch (error) {
    status.error = { message: `${error}`, stack: error?.stack };
    status.durationSec = moment().diff(start, 'seconds');
    return status;
  }

  try {
    console.log('Starting file check');
    const { filesOk, durationSec: filesOkDuration } = parser.checkFiles(
      await runCommand({
        failOnExitCode: true,
        failOnStdErr: true,
        command: `./${duplicacyBinary} check -storage ${storage} -r ${status.lastRevision.number} -files -threads ${threads}`,
      }),
    );
    status.filesOk = filesOk;
    console.log(`Files checked successfully in ${filesOkDuration}s`);
  } catch (error) {
    status.error = { message: `${error}`, stack: error?.stack };
    status.durationSec = moment().diff(start, 'seconds');
    return status;
  }

  try {
    console.log('Starting chunks check');
    const { chunksOk, durationSec: chunksOkDuration } = parser.checkChunks(
      await runCommand({
        failOnExitCode: true,
        failOnStdErr: true,
        command: `./${duplicacyBinary} check -storage ${storage} -chunks -threads ${threads}`,
      }),
    );
    status.chunksOk = chunksOk;

    console.log(`Chunks checked successfully in ${chunksOkDuration}s`);
  } catch (error) {
    status.error = { message: `${error}`, stack: error?.stack };
    status.durationSec = moment().diff(start, 'seconds');
    return status;
  }

  console.log(`Storage ${storage} checked and pruned completely and everything is good!`);
  status.durationSec = moment().diff(start, 'seconds');
  status.allOk = true;
  return status;
};

export type IntegrityExecutorReturnType = Record<string, IntegrityCheckReturn>;
const checkAllIntegrityExecutor: ExecutorType<Record<string, IntegrityCheckReturn>> = async (
  runCommand: RunCommandType,
): Promise<IntegrityExecutorReturnType> => {
  const { duplicacyConfig } = await getConfig;
  const storageNames = duplicacyConfig.map(({ name }) => name);
  await sendMessage(`\nStarting backup verify:\n${new Date()}\n${JSON.stringify(storageNames, null, '\t')}`);

  const storageStats: Record<string, IntegrityCheckReturn> = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const storage of storageNames) {
    // eslint-disable-next-line no-await-in-loop
    storageStats[storage] = await integrityCheck({ runCommand, storage });
    if (storageStats[storage].error) {
      console.log(`There was an error in ${storage} report!'`);
    }
    console.log('Small report:', JSON.stringify(storageStats[storage], null, '\t'));
    // eslint-disable-next-line no-await-in-loop
    await sendMessage(JSON.stringify(statusToSmallStatus(storageStats[storage]), null, '\t'));
  }
  return storageStats;
};
export default checkAllIntegrityExecutor;
