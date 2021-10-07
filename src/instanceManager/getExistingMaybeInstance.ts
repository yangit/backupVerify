import getConfig from '../getConfig';
import { LinodeInstanceInfoType } from './listInstances';

export default async ({
  instances,
  instancePrefix,
}: {
  instances: LinodeInstanceInfoType[];
  instancePrefix: string;
}) => {
  const config = await getConfig;
  const {
    instance: { label },
  } = config;

  return instances.find(({ label: labelLocal }) => labelLocal === `${label}-${instancePrefix}`) || null;
};
