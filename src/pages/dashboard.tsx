"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axiosinstance from "@/service";
import { DateTime } from "luxon";

export default function Dashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    let userName = localStorage.getItem("user.name");
    let userRole = localStorage.getItem("user.role");

    if (userName) {
      setName(userName);
    }
    if (userRole) {
      setRole(userRole);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (role == "admin") {
        axiosinstance.get("/api/users").then(({ data }) => {
          console.log("data.data", data.data);

          setUsers(data.data);
        });
      } else if (role == "user") {
        let userId = localStorage.getItem("user.id");
        axiosinstance.get(`/api/users/${userId}`).then(({ data }) => {
          console.log("data.data", data.data);
          let response: any = [data.data];
          setUsers(response);
        });
      }
    })();
  }, [role]);

  const deleteUser = async (user: any) => {
    await axiosinstance.delete(`/api/users/${user?.id}`);
    router.reload();
  };

  const logout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="container mt-5">
      <h2>
        Welcome {name} ({role})
      </h2>
      <button className="btn btn-primary mb-3" onClick={logout}>
        Log Out
      </button>
      {role === "admin" && (
        <button
          className="btn btn-primary mb-3"
          onClick={() => router.push("/adduser")}
        >
          Add User
        </button>
      )}
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Profile Pic</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.email}>
              <td>{user.name}</td>
              <td>
                <div>
                  <img
                    src={user.profilePic}
                    alt="Description of the image"
                    width={70}
                    height={70}
                  />
                </div>
                {user.ProfilePic}
              </td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {DateTime.fromJSDate(new Date(user.created_at)).toFormat(
                  "yyyy-MM-dd"
                )}
              </td>
              <td>
                <button
                  className="btn btn-warning btn-sm mx-1"
                  onClick={() =>
                    router.push({
                      pathname: "/updateuser",
                      query: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        password: user.password,
                      },
                    })
                  }
                >
                  Update
                </button>
                {role === "admin" && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteUser(user)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
