import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import LoginForm from './components/LoginForm';
import ContactList from './components/ContactList';
import SignUpForm from './components/SignUpForm';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user');
        setUser(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout');
      setUser(null);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Router>
      <nav>
        {user ? (
          <div>
            <span>Hello, {user.username}!</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <Link to="/login">Log In</Link>
            <Link to="/signup">Sign Up</Link>
          </div>
        )}
      </nav>
      <Routes>
        <Route path="/" element={user ? <ContactList user={user} /> : <div>You need to log in.</div>} />
        <Route path="/login" element={<LoginForm setUser={setUser} />} />
        <Route path="/signup" element={<SignUpForm setUser={setUser} />} />
      </Routes>
    </Router>
  );
};

export default App;
