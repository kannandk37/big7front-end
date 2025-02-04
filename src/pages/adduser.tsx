import { useState } from "react";
import { useRouter } from "next/router";
import axiosinstance from "../service";

export default function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("user");

  const router = useRouter();

  const handleSubmit = async () => {
    const userData = { name, email, password, role };
    try {
      let response = await axiosinstance.post("/api/users", userData);
      console.log("error", response);
      if (response.data) {
        router.back();
      }
    } catch (error: any) {
      console.log("error", error);
      setError(`${error.response.data} try diiferent email`);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create User</h2>
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
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
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Role</label>
        <select
          className="form-control"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        {error ? (
          <>
            <h2 color="red">{error}</h2>
          </>
        ) : (
          <></>
        )}
      </div>
      <button className="btn btn-primary" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}
