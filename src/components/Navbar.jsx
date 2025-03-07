import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-500 p-4 flex justify-between items-center">
      <Link to="/" className="text-white text-xl font-bold">Job Portal</Link>

      <div className="space-x-4">
        {user ? (
          <>
            <span className="text-white">Hello, {user.username}!</span>
            {user.role === "admin" && ( // Show "Post a Job" only if user is admin
              <Link to="/post-job" className="bg-white text-blue-500 px-3 py-2 rounded">
                Post a Job
              </Link>
            )}
            <button onClick={logout} className="bg-red-500 text-white px-3 py-2 rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="bg-white text-blue-500 px-3 py-2 rounded">Login</Link>
            <Link to="/signup" className="bg-white text-blue-500 px-3 py-2 rounded">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
