import moment from 'moment';
import {
  list,
  listFiles,
  checkQuick,
  checkFiles,
  checkChunks,
  compareCheckedRevisions,
  copySnapshots,
} from './duplicacyOutputParser';

const samples = {
  list: {
    exitCode: 0,
    stderr: '',
    stdMix: '',
    stdout:
      'Storage set to dropbox://mini\nSnapshot testDuplicacyContents revision 1 created at 2020-10-21 08:44 -hash -vss\nSnapshot testDuplicacyContents revision 5 created at 2020-10-22 05:48 -vss\n',
    durationSec: 1,
  },
  listFiles: {
    exitCode: 0,
    stdMix: '',
    stdout:
      'Storage set to dropbox://mini\nSnapshot testDuplicacyContents revision 5 created at 2020-10-22 05:48 -vss\nFiles: 2\n6148 2020-10-20 09:39:38 618cc1ad01f0fb47f1b0b0f4abd98576ce44fb44c5ddf7cfb4963c523df93fb3 .DS_Store\n14 2020-10-22 05:48:43 590458cf4b1d8a5ecb73da70b3ac38450a1a00e6a58dc4079217efb5c8f2923f 1.txt\nFiles: 2, total size: 6162, file chunks: 2, metadata chunks: 3\n',
    stderr: '',
    command: './duplicacy_linux_x64_2.7.1 list -storage dropbox___mini_testDuplicacyContents -r 5 -files',
    durationSec: 1,
  },
  check: {
    exitCode: 0,
    stdMix: '',
    stdout:
      'Storage set to dropbox://mini\nListing all chunks\n1 snapshots and 2 revisions\nTotal chunk size is 66,246M in 15088 chunks\nAll chunks referenced by snapshot testDuplicacyContents at revision 1 exist\nAll chunks referenced by snapshot testDuplicacyContents at revision 5 exist\n',
    stderr: '',
    command: './duplicacy_linux_x64_2.7.1 check -storage dropbox___mini_testDuplicacyContents',
    durationSec: 56,
  },
  checkFiles: {
    exitCode: 0,
    stdMix: '',
    stdout:
      'Storage set to dropbox://mini\nListing all chunks\n1 snapshots and 1 revisions\nTotal chunk size is 66,246M in 15088 chunks\nAll files in snapshot testDuplicacyContents at revision 5 have been successfully verified\n',
    stderr: '',
    command: './duplicacy_linux_x64_2.7.1 check -storage dropbox___mini_testDuplicacyContents -r 5 -files -threads 5',
    durationSec: 49,
  },
  checkFilesFail: {
    exitCode: 0,
    stdMix: '',
    stdout:
      'Storage set to dropbox://mini\nListing all chunks\n1 snapshots and 1 revisions\nTotal chunk size is 66,246M in 15088 chunks\n',
    stderr: '',
    command: './duplicacy_linux_x64_2.7.1 check -storage dropbox___mini_testDuplicacyContents -r 5 -files -threads 5',
    durationSec: 49,
  },
  checkChunks: {
    exitCode: 0,
    stdMix: '',
    stdout:
      'Storage set to dropbox://mini\nListing all chunks\n1 snapshots and 2 revisions\nTotal chunk size is 66,246M in 15088 chunks\nAll chunks referenced by snapshot testDuplicacyContents at revision 1 exist\nAll chunks referenced by snapshot testDuplicacyContents at revision 5 exist\nVerifying 8 chunks\nVerified chunk 8a509fb5e713c75a8108b898c87f35b3456f26a1abb1ec101905b5d9ad6bffe5 (1/8), 181B/s 00:00:02 12.5%\nVerified chunk 2b4c3dd7e4acfc5b6828613defd59657e93ac293991a56c6fbe787c8f840dd48 (2/8), 92B/s 00:00:02 25.0%\nVerified chunk 3069327e6950610dc9d712eb75e32873a0b8a74378b877ce90aa7a184dc88b8d (3/8), 7KB/s 00:00:01 37.5%\nVerified chunk 5bc4bbd30da07eec629c5bc1b22f80c1a17162771cf76beb2519c2f192cf2d3f (4/8), 7KB/s 00:00:00 50.0%\nVerified chunk 6586892afe55d2244c688aaa1e421df1873f0a852b1494a74725e46ba4579f60 (5/8), 7KB/s 00:00:00 62.5%\nVerified chunk 6b09f8ffbcf40a1c929368250036e9b13f68ad0633d215db0f30dd16a54d0689 (6/8), 7KB/s 00:00:00 75.0%\nVerified chunk c67a117beaf1a5ba5eece6c67d888dd53fe53752262125449822db3553a29082 (7/8), 5KB/s 00:00:00 87.5%\nVerified chunk b8e64e313a5c8b382bdb611e61a95d9cb67bd4efe0d9867ebdd330027a4716d5 (8/8), 5KB/s 00:00:00 100.0%\nAll 8 chunks have been successfully verified\n',
    stderr: '',
    command: './duplicacy_linux_x64_2.7.1 check -storage dropbox___mini_testDuplicacyContents -chunks -threads 5',
    durationSec: 48,
  },
  checkChunksFail: {
    exitCode: 0,
    stdMix: '',
    stdout:
      'Storage set to dropbox://mini\nListing all chunks\n1 snapshots and 2 revisions\nTotal chunk size is 66,246M in 15088 chunks\nAll chunks referenced by snapshot testDuplicacyContents at revision 1 exist\nAll chunks referenced by snapshot testDuplicacyContents at revision 5 exist\nVerifying 8 chunks\nVerified chunk 8a509fb5e713c75a8108b898c87f35b3456f26a1abb1ec101905b5d9ad6bffe5 (1/8), 181B/s 00:00:02 12.5%\nVerified chunk 2b4c3dd7e4acfc5b6828613defd59657e93ac293991a56c6fbe787c8f840dd48 (2/8), 92B/s 00:00:02 25.0%\nVerified chunk 3069327e6950610dc9d712eb75e32873a0b8a74378b877ce90aa7a184dc88b8d (3/8), 7KB/s 00:00:01 37.5%\nVerified chunk 5bc4bbd30da07eec629c5bc1b22f80c1a17162771cf76beb2519c2f192cf2d3f (4/8), 7KB/s 00:00:00 50.0%\nVerified chunk 6586892afe55d2244c688aaa1e421df1873f0a852b1494a74725e46ba4579f60 (5/8), 7KB/s 00:00:00 62.5%\nVerified chunk 6b09f8ffbcf40a1c929368250036e9b13f68ad0633d215db0f30dd16a54d0689 (6/8), 7KB/s 00:00:00 75.0%\nVerified chunk c67a117beaf1a5ba5eece6c67d888dd53fe53752262125449822db3553a29082 (7/8), 5KB/s 00:00:00 87.5%\nVerified chunk b8e64e313a5c8b382bdb611e61a95d9cb67bd4efe0d9867ebdd330027a4716d5 (8/8), 5KB/s 00:00:00 100.0%\n',
    stderr: '',
    command: './duplicacy_linux_x64_2.7.1 check -storage dropbox___mini_testDuplicacyContents -chunks -threads 5',
    durationSec: 48,
  },
  prune: {
    exitCode: 0,
    stdMix: '',
    stdout:
      'Storage set to dropbox://mini\nKeep 1 snapshot every 1 day(s) if older than 7 day(s)\nNo snapshot to delete\n',
    stderr: '',
    command:
      './duplicacy_linux_x64_2.7.1 prune -storage dropbox___mini_testDuplicacyContents -keep 1:7 -keep 7:30 -keep 30:180 -keep 0:360',
    durationSec: 7,
  },
  copySnapshotsExists: {
    exitCode: 0,
    stdout:
      'Repository set to duplicacyRestore/dropbox___mini_testDuplicacyContents\nSource storage set to dropbox://mini\nRepository set to duplicacyRestore/b2___yFolderBucket_testDuplicacyContents\nDestination storage set to b2://yFolderBucket\ndownload URL is: https://f002.backblazeb2.com\nSnapshot testDuplicacyContents at revision 1 already exists at the destination storage\nSnapshot testDuplicacyContents at revision 5 already exists at the destination storage\nNothing to copy, all snapshot revisions exist at the destination.\n',
    stderr: '',
    stdMix: '',
    command:
      './duplicacy_linux_x64_2.7.2 copy -threads 5 -from dropbox___mini_testDuplicacyContents -to b2___yFolderBucket_testDuplicacyContents -id testDuplicacyContents | tee ~/duplicacy.log',
    durationSec: 2,
  },
  copySnapshotsExistsFail: {
    exitCode: 0,
    stdout:
      'Repository set to duplicacyRestore/dropbox___mini_testDuplicacyContents\nSource storage set to dropbox://mini\nRepository set to duplicacyRestore/b2___yFolderBucket_testDuplicacyContents\nDestination storage set to b2://yFolderBucket\ndownload URL is: https://f002.backblazeb2.com\nSnapshot testDuplicacyContents at revision 1 already exists at the destination storage\nSnapshot testDuplicacyContents at revision 5 already exists at the destination storage\nNothing to copy, some snapshot revisions exist at the destination.\n',
    stderr: '',
    stdMix: '',
    command:
      './duplicacy_linux_x64_2.7.2 copy -threads 5 -from dropbox___mini_testDuplicacyContents -to b2___yFolderBucket_testDuplicacyContents -id testDuplicacyContents | tee ~/duplicacy.log',
    durationSec: 2,
  },
  copySnapshotsNew: {
    exitCode: 0,
    stdout:
      'Repository set to duplicacyRestore/dropbox___mini_yFolder\nSource storage set to dropbox://mini\nRepository set to duplicacyRestore/b2___yFolderBucket_yFolder\nDestination storage set to b2://yFolderBucket\ndownload URL is: https://f002.backblazeb2.com\nSnapshot yFolder at revision 1 already exists at the destination storage\nSnapshot yFolder at revision 32 already exists at the destination storage\nSnapshot yFolder at revision 59 already exists at the destination storage\nSnapshot yFolder at revision 87 already exists at the destination storage\nSnapshot yFolder at revision 102 already exists at the destination storage\nSnapshot yFolder at revision 111 already exists at the destination storage\nSnapshot yFolder at revision 117 already exists at the destination storage\nSnapshot yFolder at revision 124 already exists at the destination storage\nSnapshot yFolder at revision 131 already exists at the destination storage\nSnapshot yFolder at revision 138 already exists at the destination storage\nSnapshot yFolder at revision 145 already exists at the destination storage\nSnapshot yFolder at revision 147 already exists at the destination storage\nSnapshot yFolder at revision 151 already exists at the destination storage\nSnapshot yFolder at revision 152 already exists at the destination storage\nSnapshot yFolder at revision 153 already exists at the destination storage\nSnapshot yFolder at revision 154 already exists at the destination storage\nChunks to copy: 12, to skip: 140, total: 152\nCopied chunk 33a9c2580df937946dcbe0b573e0c3dc0f24c88714a1b31cca9b02ead6409544 (1/12) 1KB/s 00:00:09 8.3%\nCopied chunk 375db6d5fd79db5175886e59445d6a599f6ce6ed660c798fe4dcab97be3fa267 (2/12) 1KB/s 00:00:09 16.7%\nCopied chunk 6e902d5fc58ad147158aae8bd1951530f9d4193cfba0a581c3b0c7dacf318e28 (3/12) 6KB/s 00:00:06 25.0%\nCopied chunk a304fe8e9a4fb05d4185a48a82591d04dbac972e403a9cffeaee558394ce78d0 (4/12) 273KB/s 00:00:06 33.3%\nCopied chunk b9bdf403a1ea94c0068b9b7a797c3091939f2d743098b5c47c3491d6de13f68e (6/12) 1.09MB/s 00:00:03 50.0%\nCopied chunk c76b01eaed58a63448dfbf584a2e686a4a4ca1cc75ac1d16684aa42a38e044bc (5/12) 1.08MB/s 00:00:05 41.7%\nCopied chunk 6930436f3040e76bbaf78c996872c9e2815f3af1df849df8fc1e4371b5d56c9e (7/12) 1.49MB/s 00:00:03 58.3%\nCopied chunk 00b49ede1615c9bfdc6689a8d5240bda2daa72715e3449ab45a241ea6a10865d (8/12) 1.48MB/s 00:00:02 66.7%\nCopied chunk 0a26be35ce5052cc1c1f31062be389f852f5782c22070f686b96f646fa3d2d1d (9/12) 2.37MB/s 00:00:02 75.0%\nCopied chunk bcfdc82c8c3d9e553370cc26f09e19bd2a6660879474ae08c533611f79c69a53 (10/12) 3.08MB/s 00:00:01 83.3%\nCopied chunk 9dd0940be34f574c922a201ebcf064f922ee6f62d269bdd69e6c339609ff2f68 (11/12) 3.19MB/s 00:00:00 91.7%\nCopied chunk b1e4f322f3a9f96ed2f8cdae10a8a2ff96bb8967a3d2b2f1a373d9ba474a103f (12/12) 3.87MB/s 00:00:00 100.0%\nCopied 12 new chunks and skipped 140 existing chunks\nCopied snapshot yFolder at revision 155\nCopied snapshot yFolder at revision 156\n',
    stderr: '',
    stdMix: '',
    command:
      './duplicacy_linux_x64_2.7.2 copy -threads 5 -from dropbox___mini_yFolder -to b2___yFolderBucket_yFolder -id yFolder',
    durationSec: 15,
  },
  copySnapshotsNewFail: {
    exitCode: 0,
    stdout:
      'Repository set to duplicacyRestore/dropbox___mini_yFolder\nSource storage set to dropbox://mini\nRepository set to duplicacyRestore/b2___yFolderBucket_yFolder\nDestination storage set to b2://yFolderBucket\ndownload URL is: https://f002.backblazeb2.com\nSnapshot yFolder at revision 1 already exists at the destination storage\nSnapshot yFolder at revision 32 already exists at the destination storage\nSnapshot yFolder at revision 59 already exists at the destination storage\nSnapshot yFolder at revision 87 already exists at the destination storage\nSnapshot yFolder at revision 102 already exists at the destination storage\nSnapshot yFolder at revision 111 already exists at the destination storage\nSnapshot yFolder at revision 117 already exists at the destination storage\nSnapshot yFolder at revision 124 already exists at the destination storage\nSnapshot yFolder at revision 131 already exists at the destination storage\nSnapshot yFolder at revision 138 already exists at the destination storage\nSnapshot yFolder at revision 145 already exists at the destination storage\nSnapshot yFolder at revision 147 already exists at the destination storage\nSnapshot yFolder at revision 151 already exists at the destination storage\nSnapshot yFolder at revision 152 already exists at the destination storage\nSnapshot yFolder at revision 153 already exists at the destination storage\nSnapshot yFolder at revision 154 already exists at the destination storage\nChunks to copy: 12, to skip: 140, total: 152\nCopied chunk 33a9c2580df937946dcbe0b573e0c3dc0f24c88714a1b31cca9b02ead6409544 (1/12) 1KB/s 00:00:09 8.3%\nCopied chunk 375db6d5fd79db5175886e59445d6a599f6ce6ed660c798fe4dcab97be3fa267 (2/12) 1KB/s 00:00:09 16.7%\nCopied chunk 6e902d5fc58ad147158aae8bd1951530f9d4193cfba0a581c3b0c7dacf318e28 (3/12) 6KB/s 00:00:06 25.0%\nCopied chunk a304fe8e9a4fb05d4185a48a82591d04dbac972e403a9cffeaee558394ce78d0 (4/12) 273KB/s 00:00:06 33.3%\nCopied chunk b9bdf403a1ea94c0068b9b7a797c3091939f2d743098b5c47c3491d6de13f68e (6/12) 1.09MB/s 00:00:03 50.0%\nCopied chunk c76b01eaed58a63448dfbf584a2e686a4a4ca1cc75ac1d16684aa42a38e044bc (5/12) 1.08MB/s 00:00:05 41.7%\nCopied chunk 6930436f3040e76bbaf78c996872c9e2815f3af1df849df8fc1e4371b5d56c9e (7/12) 1.49MB/s 00:00:03 58.3%\nCopied chunk 00b49ede1615c9bfdc6689a8d5240bda2daa72715e3449ab45a241ea6a10865d (8/12) 1.48MB/s 00:00:02 66.7%\nCopied chunk 0a26be35ce5052cc1c1f31062be389f852f5782c22070f686b96f646fa3d2d1d (9/12) 2.37MB/s 00:00:02 75.0%\nCopied chunk bcfdc82c8c3d9e553370cc26f09e19bd2a6660879474ae08c533611f79c69a53 (10/12) 3.08MB/s 00:00:01 83.3%\nCopied chunk 9dd0940be34f574c922a201ebcf064f922ee6f62d269bdd69e6c339609ff2f68 (11/12) 3.19MB/s 00:00:00 91.7%\nCopied chunk b1e4f322f3a9f96ed2f8cdae10a8a2ff96bb8967a3d2b2f1a373d9ba474a103f (12/12) 3.87MB/s 00:00:00 100.0%\nCopied 11 new chunks and skipped 140 existing chunks\nCopied snapshot yFolder at revision 155\nCopied snapshot yFolder at revision 156\n',
    stderr: '',
    stdMix: '',
    command:
      './duplicacy_linux_x64_2.7.2 copy -threads 5 -from dropbox___mini_yFolder -to b2___yFolderBucket_yFolder -id yFolder',
    durationSec: 15,
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

test('copySnapshots', () => {
  expect(copySnapshots(samples.copySnapshotsExists)).toEqual({ copyOk: true, durationSec: 2 });
  expect(() => copySnapshots(samples.copySnapshotsExistsFail)).toThrow();
  expect(copySnapshots(samples.copySnapshotsNew)).toEqual({ copyOk: true, durationSec: 15 });
  expect(() => copySnapshots(samples.copySnapshotsNewFail)).toThrow();
});
