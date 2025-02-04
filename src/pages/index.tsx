import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <div className="container text-center mt-5">
      <h1>Welcome</h1>
      <div className="mt-4">
        <button
          className="btn btn-primary mx-2"
          onClick={() => router.push("/signup")}
        >
          Sign Up
        </button>
        <button
          className="btn btn-success mx-2"
          onClick={() => router.push("/login")}
        >
          Login
        </button>
      </div>
    </div>
  );
}
