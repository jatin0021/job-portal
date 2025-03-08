import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Get navigation function

  const handleLogout = async () => {
    await logout();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <nav className="bg-blue-500 p-4 flex justify-between items-center">
      <Link to="/" className="text-white text-xl font-bold">Job Portal</Link>

      <div className="space-x-4">
        {user ? (
          <>
            <span className="text-white">Hello, {user.username}!</span>
            {user.role === "admin" && (
              <>
                <Link to="/post-job" className="bg-white text-blue-500 px-3 py-2 rounded">Post a Job</Link>
                <Link to="/admin-dashboard" className="bg-white text-blue-500 px-3 py-2 rounded">Admin Dashboard</Link>
              </>
            )}
            <Link to="/dashboard" className="bg-white text-blue-500 px-3 py-2 rounded">Dashboard</Link>
            <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-2 rounded">
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
