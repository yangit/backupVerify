import deleteInstanceById from './deleteInstanceById';
import startInstance from './startInstance';
import waitForInstanceRunning from './waitForInstanceRunning';
import waitForSSHReady from './waitForSSHReady';
import getExistingMaybeInstance from './getExistingMaybeInstance';
import listInstances from './listInstances';
import prepareDuplicacy from './prepareDuplicacy';

export default (instancePrefix: string) => {
  return {
    up: async () => {
      const instances = await listInstances();
      const maybeInstance = await getExistingMaybeInstance({ instancePrefix, instances });
      if (!maybeInstance) {
        await startInstance(instancePrefix);
      }
      console.log('Instance exists');

      const {
        ipv4: { 0: ip },
      } = await waitForInstanceRunning(instancePrefix);

      console.log('Instance running');
      await waitForSSHReady(ip);
      console.log('Instance SSH ready');
      await prepareDuplicacy(ip);
      return ip;
    },
    down: async () => {
      const instances = await listInstances();
      const maybeInstance = await getExistingMaybeInstance({ instancePrefix, instances });
      if (!maybeInstance) {
        throw new Error(`Instance never existed, but I tried to kill it. How odd. ${instancePrefix}`);
      }

      const result = await deleteInstanceById(maybeInstance.id);
      console.log(`Instance ${maybeInstance.id} killed`);
      return result;
    },
  };
};
