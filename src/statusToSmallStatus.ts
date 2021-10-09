import fp from 'lodash/fp';
import { IntegrityCheckReturn } from './integrityCheck';

export default (report: IntegrityCheckReturn) => {
  return {
    ...fp.omit('revisions')(report),
    error: report.error ? { stack: report.error.stack, message: report.error.message.slice(0, 2000) } : null,
  };
};
