import axios from 'axios';
import getConfig from '../getConfig';

export default async (instancePrefix:string) => {
  const {
    instance: { label, region, root_pass, tags, type, image },
    linodeToken,
    sshPublicKey,
  } = await getConfig;

  console.log('Starting a new instance');

  return axios({
    method: 'POST',
    url: 'https://api.linode.com/v4/linode/instances',
    headers: {
      Authorization: `Bearer ${linodeToken}`,
    },
    data: {
      authorized_keys: [sshPublicKey],
      root_pass,
      backups_enabled: false,
      booted: true,
      image,
      label:`${label}-${instancePrefix}`,
      region,
      tags,
      type,
    },
  }).then(
    ({ data }) => data,
    (error) => {
      if (
        error?.response?.status === 400 &&
        error?.response?.data?.errors.find(
          (errorData: { reason: string; field: string }) =>
            errorData?.reason === 'Label must be unique among your linodes',
        )
      ) {
        return true;
      }
      throw error;
    },
  );
};
