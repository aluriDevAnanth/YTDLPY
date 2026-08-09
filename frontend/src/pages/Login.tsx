import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import axios from "axios";
import { useAuthStore } from "../context/authStore";
const API_BASE = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
export default function Login() {
  const { isAuthOpen, setAuth } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const endpoint = isSignUp ? `${API_BASE}/api/auth/register` : `${API_BASE}/api/auth/login`;
    try {
      const res = await axios.post(endpoint, {
        username,
        password,
      });
      const token = res.data.access_token;
      const meRes = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuth(token, meRes.data);
    } catch (err: any) {
      console.error(isSignUp ? "Sign Up failed:" : "Login failed:", err);
      setError(err.response?.data?.detail || (isSignUp ? "Registration failed. Try a different username." : "Login failed. Check credentials."));
    } finally {
      setLoading(false);
    }
  };
  if (!isAuthOpen) return null;
  return (
    <Dialog
      header={isSignUp ? "Create New Account" : "Authentication Required"}
      visible={isAuthOpen}
      style={{ width: "420px" }}
      closable={false}
      onHide={() => { }}
      modal
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2 font-sans">
        {error && <Message severity="error" text={error} />}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-xs font-semibold text-gray-300">
            Username
          </label>
          <InputText
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter username..."
            autoFocus
            className="p-inputtext-sm w-full"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-gray-300">
            Password
          </label>
          <Password
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            toggleMask
            feedback={isSignUp}
            required
            placeholder="Enter password..."
            className="w-full"
            inputClassName="w-full p-inputtext-sm"
          />
        </div>
        {!isSignUp && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded text-xs text-blue-400">
            💡 Default Administrator credentials: <b>admin</b> / <b>admin123</b>
          </div>
        )}
        <Button
          type="submit"
          label={isSignUp ? "Create Account & Sign In" : "Sign In"}
          icon={isSignUp ? "pi pi-user-plus" : "pi pi-sign-in"}
          severity={isSignUp ? "success" : undefined}
          loading={loading}
          className="w-full mt-1"
        />
        <div className="flex justify-center items-center mt-2 text-xs">
          <Button
            type="button"
            link
            label={isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              if (!isSignUp) {
                setUsername("");
                setPassword("");
              } else {
                setUsername("admin");
                setPassword("admin123");
              }
            }}
            className="p-button-link text-xs p-0 text-cyan-400"
          />
        </div>
      </form>
    </Dialog>
  );
}
