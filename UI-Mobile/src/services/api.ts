import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:8100/api';

//create the axios instance 
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

//Request iterceptor to attach token to every request
api.interceptors.request.use(
    async (config) => {
        //1. ask the phone's secure storage for the token
        const token = await SecureStore.getItemAsync('token');
        //2. if we have a token, attach it to the request headers
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    }
);

//Response interceptor every time we get a response from the server, we check if it's a 401 (unauthorized) error.
//  If it is, we can log the user out or redirect them to the login page.
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        //if spring boot returns 401 Unauthorized (token expired or invalid)
        if(error.response && error.response.status === 401) {   
            console.log("Token expired or unauthorized. Logging out ...");
            //Delete token from the phone 
            await SecureStore.deleteItemAsync('token');
        }
        return Promise.reject(error);
    }
);  

export default api;