import fp from 'lodash/fp';
import { IntegrityCheckReturn } from './types';

const messageLimit = 1000;
export default (report: IntegrityCheckReturn) => {
  return {
    ...fp.omit('revisions')(report),
    error: report.error
      ? { stack: report.error.stack.slice(0, messageLimit), message: report.error.message.slice(0, messageLimit) }
      : null,
  };
};
