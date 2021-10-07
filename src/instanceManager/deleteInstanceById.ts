import axios from 'axios';
import getConfig from '../getConfig';

export default async (id: number): Promise<true> => {
  const { linodeToken } = await getConfig;
  return axios({
    method: 'DELETE',
    url: `https://api.linode.com/v4/linode/instances/${id}`,
    headers: {
      Authorization: `Bearer ${linodeToken}`,
    },
  }).then(() => true);
};
