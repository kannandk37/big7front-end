import { useState } from "react";
import { useRouter } from "next/router";
import axiosinstance from "@/service";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      let result: any = await axiosinstance.post("/login", {
        email,
        password,
      });
      console.log("result", result);
      result = result?.data;
      if (result?.user) {
        localStorage.setItem("user.name", result.user.name);
        localStorage.setItem("user.role", result.user.role);
        localStorage.setItem("user.id", result.user.id);
        localStorage.setItem("token", result.token);
        // login(email, password);
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Unable To loggin");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />
      </div>
      {error && (
        <>
          <h3>{error}</h3>
        </>
      )}
      <button className="btn btn-success" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
