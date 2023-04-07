import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      setUser(response.data);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/signup');
      } else {
        console.log(err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username:</label>
      <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <br />
      <label htmlFor="password">Password:</label>
      <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <br />
      <button type="submit">Log In</button>
    </form>
  );
};

export default LoginForm;
