import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axiosinstance from "../service";

export default function updateUser() {
  const router = useRouter();
  const [name, setName] = useState<any>("");
  const [email, setEmail] = useState<any>("");
  const [password, setPassword] = useState<any>("");
  const [editPassword, setEditPassword] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<any>("user");
  const [userId, setUserId] = useState<any>("");

  useEffect(() => {
    console.log(router);
    if (router.query) {
      setEmail(router.query.email);
      setName(router.query.name);
      setUserId(router.query.id);
      setRole(router.query.role);
      if (router.query.id == localStorage.getItem("user.id")) {
        setEditPassword(true);
      }
    }
  }, []);

  const handleSubmit = async () => {
    const userData = { name, email, password, role };
    try {
      let response = await axiosinstance.put(`/api/users/${userId}`, userData);

      if (response.data) {
        setEditPassword(false);
        console.log(
          userData.password ? userData.password : null,
          userData.password,
          typeof userData.password
        );
        if (
          router.query.id == localStorage.getItem("user.id") &&
          userData.password
        ) {
          localStorage.clear();
          router.push("/");
        } else {
          router.back();
        }
      }
    } catch (error: any) {
      console.log("error", error);
      setError(`${error.response.data} try diiferent email`);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Update User</h2>
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
      {editPassword && (
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      )}
      {role == "admin" && (
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
      )}
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
