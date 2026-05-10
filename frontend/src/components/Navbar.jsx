import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-brand-dark text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">miniudemy</Link>
        <div className="space-x-4">
          {token ? (
            <>
              <Link to="/dashboard" className="hover:text-brand-light">Dashboard</Link>
              <Link to="/courses" className="hover:text-brand-light">Courses</Link>
              <Link to="/notifications" className="hover:text-brand-light">Notifications</Link>
              <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-brand-light">Login</Link>
              <Link to="/register" className="bg-brand text-white px-3 py-1 rounded hover:bg-brand-light transition">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
