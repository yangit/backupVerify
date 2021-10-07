import axios from 'axios';

export default (msg: string) =>
  axios({
    method: 'post',
    url: 'https://bot.yan.my/tg/sendMessage',
    headers: {
      'Content-Type': 'text/plain',
    },
    data: `BackupBot:${msg}`,
  });

// export default (msg: string) => {
//     console.log(msg) 
//     return Promise.resolve()
// }