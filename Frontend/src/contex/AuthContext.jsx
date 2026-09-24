import { createContext, useMemo, useState } from "react";
import { login as loginService } from '../service/auth.service';
import { clearSesion, getToken, getUser, saveSession} from '../utils/storage';

export const authContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(getToken());
    const [user, setUser] =useState(getUser());

    async function login (credentials) {
        const result = await loginService(credentials);
        saveSession(result.token, result.user);
        setToken(result.token);
        setUser(result.user);
    }

    function logout() {
        clearSesion();
        setToken(null);
        setUser(null);
    }

    const value = useMemo(
        () => ({
            token,
            user,
            isAuthenticated: Boolean(token),
            login,
            logout
        }),
        [token, user]
    );

    return <authContext.Provider value={value}>{children}</authContext.Provider>;
}