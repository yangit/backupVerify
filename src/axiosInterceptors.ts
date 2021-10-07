import axios, { AxiosError } from 'axios';

axios.interceptors.request.use(
  (config) => config,
  (error) => {
    console.log('Axios request error config:', error.config);
    return Promise.reject(error);
  },
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.log('Axios response error config:', error.config);
    console.log('Axios response error status:', error?.response?.status);
    console.log('Axios response error headers:', error?.response?.headers);
    console.log('Axios response error data:', error?.response?.data);

    return Promise.reject(error);
  },
);
