import { useContext } from "react";
import { authContext } from "../contex/AuthContext";

export function useAuth() {
    return useContext(authContext);
}