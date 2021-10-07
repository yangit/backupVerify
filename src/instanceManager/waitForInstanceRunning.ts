import getExistingMaybeInstance from './getExistingMaybeInstance';
import listInstances, { LinodeInstanceInfoType } from './listInstances';

export default async (instancePrefix: string): Promise<LinodeInstanceInfoType> => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const instances = await listInstances();    
    
    // eslint-disable-next-line no-await-in-loop
    const mayBeExistingInstance = await getExistingMaybeInstance({ instances, instancePrefix });
    if (mayBeExistingInstance?.status === 'running') {
      return mayBeExistingInstance;
    }

    console.log(`Instance status is: ${mayBeExistingInstance?.status}`);

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
};
