import moment from 'moment';
import { list, listFiles, checkQuick, checkFiles, checkChunks, compareCheckedRevisions } from './duplicacyOutputParser';

const samples = {
  list: {
    exitCode: 0,
    stderr: '',
    stdout:
      'Storage set to dropbox://mini\nSnapshot testDuplicacyContents revision 1 created at 2020-10-21 08:44 -hash -vss\nSnapshot testDuplicacyContents revision 5 created at 2020-10-22 05:48 -vss\n',
    durationSec: 1,
  },
  listFiles: {
    exitCode: 0,
    stdout:
      'Storage set to dropbox://mini\nSnapshot testDuplicacyContents revision 5 created at 2020-10-22 05:48 -vss\nFiles: 2\n6148 2020-10-20 09:39:38 618cc1ad01f0fb47f1b0b0f4abd98576ce44fb44c5ddf7cfb4963c523df93fb3 .DS_Store\n14 2020-10-22 05:48:43 590458cf4b1d8a5ecb73da70b3ac38450a1a00e6a58dc4079217efb5c8f2923f 1.txt\nFiles: 2, total size: 6162, file chunks: 2, metadata chunks: 3\n',
    stderr: '',
    command: './duplicacy_linux_x64_2.7.1 list -storage dropbox___mini_testDuplicacyContents -r 5 -files',
    durationSec: 1,
  },
  check: {
    exitCode: 0,
    stdout:
      'Storage set to dropbox://mini\nListing all chunks\n1 snapshots and 2 revisions\nTotal chunk size is 66,246M in 15088 chunks\nAll chunks referenced by snapshot testDuplicacyContents at revision 1 exist\nAll chunks referenced by snapshot testDuplicacyContents at revision 5 exist\n',
    stderr: '',
    command: './duplicacy_linux_x64_2.7.1 check -storage dropbox___mini_testDuplicacyContents',
    durationSec: 56,
  },
  checkFiles: {
    exitCode: 0,
    stdout:
      'Storage set to dropbox://mini\nListing all chunks\n1 snapshots and 1 revisions\nTotal chunk size is 66,246M in 15088 chunks\nAll files in snapshot testDuplicacyContents at revision 5 have been successfully verified\n',
    stderr: '',
    command: './duplicacy_linux_x64_2.7.1 check -storage dropbox___mini_testDuplicacyContents -r 5 -files -threads 5',
    durationSec: 49,
  },
  checkFilesFail: {
    exitCode: 0,
    stdout:
      'Storage set to dropbox://mini\nListing all chunks\n1 snapshots and 1 revisions\nTotal chunk size is 66,246M in 15088 chunks\n',
    stderr: '',
    command: './duplicacy_linux_x64_2.7.1 check -storage dropbox___mini_testDuplicacyContents -r 5 -files -threads 5',
    durationSec: 49,
  },
  checkChunks: {
    exitCode: 0,
    stdout:
      'Storage set to dropbox://mini\nListing all chunks\n1 snapshots and 2 revisions\nTotal chunk size is 66,246M in 15088 chunks\nAll chunks referenced by snapshot testDuplicacyContents at revision 1 exist\nAll chunks referenced by snapshot testDuplicacyContents at revision 5 exist\nVerifying 8 chunks\nVerified chunk 8a509fb5e713c75a8108b898c87f35b3456f26a1abb1ec101905b5d9ad6bffe5 (1/8), 181B/s 00:00:02 12.5%\nVerified chunk 2b4c3dd7e4acfc5b6828613defd59657e93ac293991a56c6fbe787c8f840dd48 (2/8), 92B/s 00:00:02 25.0%\nVerified chunk 3069327e6950610dc9d712eb75e32873a0b8a74378b877ce90aa7a184dc88b8d (3/8), 7KB/s 00:00:01 37.5%\nVerified chunk 5bc4bbd30da07eec629c5bc1b22f80c1a17162771cf76beb2519c2f192cf2d3f (4/8), 7KB/s 00:00:00 50.0%\nVerified chunk 6586892afe55d2244c688aaa1e421df1873f0a852b1494a74725e46ba4579f60 (5/8), 7KB/s 00:00:00 62.5%\nVerified chunk 6b09f8ffbcf40a1c929368250036e9b13f68ad0633d215db0f30dd16a54d0689 (6/8), 7KB/s 00:00:00 75.0%\nVerified chunk c67a117beaf1a5ba5eece6c67d888dd53fe53752262125449822db3553a29082 (7/8), 5KB/s 00:00:00 87.5%\nVerified chunk b8e64e313a5c8b382bdb611e61a95d9cb67bd4efe0d9867ebdd330027a4716d5 (8/8), 5KB/s 00:00:00 100.0%\nAll 8 chunks have been successfully verified\n',
    stderr: '',
    command: './duplicacy_linux_x64_2.7.1 check -storage dropbox___mini_testDuplicacyContents -chunks -threads 5',
    durationSec: 48,
  },
  checkChunksFail: {
    exitCode: 0,
    stdout:
      'Storage set to dropbox://mini\nListing all chunks\n1 snapshots and 2 revisions\nTotal chunk size is 66,246M in 15088 chunks\nAll chunks referenced by snapshot testDuplicacyContents at revision 1 exist\nAll chunks referenced by snapshot testDuplicacyContents at revision 5 exist\nVerifying 8 chunks\nVerified chunk 8a509fb5e713c75a8108b898c87f35b3456f26a1abb1ec101905b5d9ad6bffe5 (1/8), 181B/s 00:00:02 12.5%\nVerified chunk 2b4c3dd7e4acfc5b6828613defd59657e93ac293991a56c6fbe787c8f840dd48 (2/8), 92B/s 00:00:02 25.0%\nVerified chunk 3069327e6950610dc9d712eb75e32873a0b8a74378b877ce90aa7a184dc88b8d (3/8), 7KB/s 00:00:01 37.5%\nVerified chunk 5bc4bbd30da07eec629c5bc1b22f80c1a17162771cf76beb2519c2f192cf2d3f (4/8), 7KB/s 00:00:00 50.0%\nVerified chunk 6586892afe55d2244c688aaa1e421df1873f0a852b1494a74725e46ba4579f60 (5/8), 7KB/s 00:00:00 62.5%\nVerified chunk 6b09f8ffbcf40a1c929368250036e9b13f68ad0633d215db0f30dd16a54d0689 (6/8), 7KB/s 00:00:00 75.0%\nVerified chunk c67a117beaf1a5ba5eece6c67d888dd53fe53752262125449822db3553a29082 (7/8), 5KB/s 00:00:00 87.5%\nVerified chunk b8e64e313a5c8b382bdb611e61a95d9cb67bd4efe0d9867ebdd330027a4716d5 (8/8), 5KB/s 00:00:00 100.0%\n',
    stderr: '',
    command: './duplicacy_linux_x64_2.7.1 check -storage dropbox___mini_testDuplicacyContents -chunks -threads 5',
    durationSec: 48,
  },
  prune: {
    exitCode: 0,
    stdout:
      'Storage set to dropbox://mini\nKeep 1 snapshot every 1 day(s) if older than 7 day(s)\nNo snapshot to delete\n',
    stderr: '',
    command:
      './duplicacy_linux_x64_2.7.1 prune -storage dropbox___mini_testDuplicacyContents -keep 1:7 -keep 7:30 -keep 30:180 -keep 0:360',
    durationSec: 7,
  },
};

test('list', () => {
  expect(list(samples.list)).toEqual({
    revisions: [
      { number: 1, created: moment('2020-10-21 08:44') },
      { number: 5, created: moment('2020-10-22 05:48') },
    ],
  });
});

test('listFiles', () => {
  expect(listFiles(samples.listFiles)).toEqual({
    files: { count: 2, totalSize: 6162, chunks: 2 },
  });
});

test('checkQuick', () => {
  expect(checkQuick(samples.check)).toEqual({
    checkedRevisions: [1, 5],
    durationSec: 56,
  });
});

test('checkFiles', () => {
  expect(checkFiles(samples.checkFiles)).toEqual({ filesOk: true, durationSec: 49 });
  expect(() => checkFiles(samples.checkFilesFail)).toThrow();
});

test('checkChunks', () => {
  expect(checkChunks(samples.checkChunks)).toEqual({ chunksOk: true, durationSec: 48 });
  expect(() => checkChunks(samples.checkChunksFail)).toThrow();
});

test('compareCheckedRevisions', () => {
  expect(compareCheckedRevisions({ checked: [1, 2, 3], all: [1, 3, 2] })).toBeTruthy();
  expect(() => compareCheckedRevisions({ checked: [1, 2, 3], all: [1, 3, 4] })).toThrow();
});
