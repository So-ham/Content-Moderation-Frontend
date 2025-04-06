import { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!username || !email || !password) {
      setError('All fields are required');
      return;
    }

    try {
      const res = await fetch('http://34.47.206.67:8081/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save token in cookies
        Cookies.set('token', data.token, { expires: 7 }); // Token expires in 7 days
        // Redirect to posts page
        router.push('/posts');
      } else {
        setError(data.message || 'Failed to signup');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error signing up:', err);
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSignupSubmit} className="signup-form">
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
          required 
        />
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
        />
        <button type="submit">Sign Up</button>
      </form>

      <style jsx>{`
        .signup-container {
          padding: 20px;
          max-width: 400px;
          margin: 0 auto;
          font-family: Arial, sans-serif;
        }

        .error-message {
          color: red;
          margin-bottom: 10px;
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .signup-form input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }

        .signup-form button {
          padding: 10px 15px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .signup-form button:hover {
          background-color: #005bb5;
        }

        h2 {
          text-align: center;
        }
      `}</style>
    </div>
  );
}
