import * as SecureStore from 'expo-secure-store';
import React, { createContext, useEffect, useState } from 'react';
import api from '../services/api';


interface AuthContextType {
    user: any;
    loading: boolean;
    login: (identifier: string, password: string) => Promise<any>;
    register: (username: string, email: string, password: string) => Promise<any>;
    verifyEmail: (email: string, code: string) => Promise<any>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<any>(null);
    // Set loading to true initially so the app doesn't flash the login screen 
    // while we check if the user is already signed in.
    const [loading, setLoading] = useState(true);
    // 1. Check for existing login when the app first opens
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                //Retrieve the token securely (notice we have to await it now)
                const token = await SecureStore.getItemAsync('token');

                if (token) {
                    //Attach token to our Axios header
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    //Fetch current user details from spring boot
                    const response = await api.get('/users/me');
                    setUser(response.data);
                }
            } catch (error) {
                console.error("Session check failed", error);
                //If the token si expired or broken, clean it up;
                await SecureStore.deleteItemAsync('token');
            } finally {
                setLoading(false);
            }
        };
        checkUserSession();
    }, []);

    // 2. Login function
    const login = async (identifier: string, password: string) => {
        //send credentials to spring boot
        const response = await api.post('/auth/login', { identifier, password });

        //assuming your backend return {token, user} on successful login
        const { token, user: userData } = response.data;

        //save token to device hardware storage
        await SecureStore.setItemAsync('token', token);

        //set token for future api calls
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        return response.data;
    };

    //3. Register function
    const register = async (username: string, email: string, password: string) => {
        const response = await api.post('/auth/register', { username, email, password })
        return response.data;
    };
    //4. Verify email function
    const verifyEmail = async (email: string, code: string) => {
        const response = await api.post('/auth/verify', { email, code });
        return response.data;
    };
    //5. Logout function 
    const logout = async () => {
        //Delete token from phone storage
        await SecureStore.deleteItemAsync('token');

        //Remove token from axios headers
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, verifyEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

