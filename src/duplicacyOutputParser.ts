import moment from 'moment';
import fs from 'fs';
import fp from 'lodash/fp';
import { RunCommandReturnRaw } from './runViaSSH';

const match = {
  revisions: /revision (\d+) created at (\d{4}-\d{2}-\d{2} \d{2}:\d{2})/g,
  filesStats: /^Files: (\d+), total size: (\d+), file chunks: (\d+), metadata chunks: (\d+)$/,
  checkQuick: /All chunks referenced by snapshot [^\s]+ at revision (\d+) exist/g,
  checkFiles: /\nAll files in snapshot [^\s]+ at revision \d+ have been successfully verified\n/,
  checkChunks: /All \d+ chunks have been successfully verified/,
};

export const list = ({ stdout }: RunCommandReturnRaw) => ({
  revisions: [...stdout.matchAll(match.revisions)].map(([, revision, created]: RegExpMatchArray) => ({
    number: parseInt(revision, 10),
    created: moment(created),
  })),
});

export const jsonWrite = (params: RunCommandReturnRaw) => {
  fs.writeFileSync(`${new Date().toISOString()}.json`, JSON.stringify(params, null, '\t'));
};

export const listFiles = ({
  stdout,
}: RunCommandReturnRaw): { files: { count: number; totalSize: number; chunks: number } } => {
  const splat = stdout.split('\n');
  const lastLine = splat[splat.length - 2];
  const [, count, totalSize, chunks] = lastLine.match(match.filesStats) || [];
  return {
    // @ts-ignore
    files: fp.mapValues(fp.parseInt(10))({ count, totalSize, chunks }),
  };
};

export const checkQuick = ({
  stdout,
  durationSec,
}: RunCommandReturnRaw): { checkedRevisions: number[]; durationSec: number } => ({
  checkedRevisions: [...stdout.matchAll(match.checkQuick)].map((arr: RegExpMatchArray) => arr[1]).map(fp.parseInt(10)),
  durationSec,
});

export const checkFiles = ({ stdout, durationSec }: RunCommandReturnRaw): { filesOk: true; durationSec: number } => {
  const result = match.checkFiles.test(stdout);
  if (!result) {
    throw new Error('checkFiles failed with exit code 0, very odd');
  }
  return { filesOk: true, durationSec };
};

export const checkChunks = ({ stdout, durationSec }: RunCommandReturnRaw): { chunksOk: true; durationSec: number } => {
  const result = match.checkChunks.test(stdout);
  if (!result) {
    throw new Error('checkChunks failed with exit code 0, very odd');
  }
  return { chunksOk: true, durationSec };
};

export const compareCheckedRevisions = ({ checked, all }: { checked: number[]; all: number[] }): true => {
  const result = JSON.stringify([...all].sort()) === JSON.stringify([...checked].sort());
  if (!result) {
    throw new Error(`Not all revisions passed quick check\n${JSON.stringify({ checked, all })}`);
  }
  return result;
};
