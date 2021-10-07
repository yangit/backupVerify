import axios, { AxiosResponse } from 'axios';
import getConfig from '../getConfig';

interface LinodeInstanceInfoResponseType {
  data: LinodeInstanceInfoType[];
}
export interface LinodeInstanceInfoType {
  id: number;
  ipv4: string[];
  tags: string[];
  label: string;
  status: string;
}
export default async (): Promise<LinodeInstanceInfoType[]> => {
  const config = await getConfig;
  return axios({
    method: 'GET',
    url: 'https://api.linode.com/v4/linode/instances',
    headers: {
      Authorization: `Bearer ${config.linodeToken}`,
    },
  }).then(({ data }: AxiosResponse<LinodeInstanceInfoResponseType>) => data.data);
};
