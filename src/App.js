import { useState } from 'react';
import { Moon, Sun, LogOut, Trash2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase config (Consider moving to .env for production)
const firebaseConfig = {
  apiKey: "AIzaSyDojFudKt9k-cLmpzFKDZdU7XLkUHgPxx8",
  authDomain: "instagram-clone-ab65f.firebaseapp.com",
  databaseURL: "https://instagram-clone-ab65f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "instagram-clone-ab65f",
  storageBucket: "instagram-clone-ab65f.appspot.com",
  messagingSenderId: "1070350682511",
  appId: "1:1070350682511:web:8a30213fd482f6af1063fa",
  measurementId: "G-S91WM03QR4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI Components (Consider moving to a separate file)
function Button({ children, onClick, variant = "default", disabled, className = "", ...props }) {
  const variantClasses = {
    default: 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-400',
    outline: 'border border-gray-300 text-black hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400',
    destructive: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
  };
  return (
    <button
      className={`px-4 py-2 rounded transition ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({ id, label, type, value, onChange, required, disabled, className = "", ...props }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-1 text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full p-2 border rounded transition ${className}`}
        {...props}
      />
    </div>
  );
}

function Switch({ checked, onChange }) {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`block w-10 h-6 rounded-full transition ${checked ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
        <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition ${checked ? 'translate-x-4 bg-white' : 'bg-white'}`}></div>
      </div>
    </label>
  );
}

// Custom hook for auth logic
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = async (email, password, username) => {
    setLoading(true);
    setError(null);
    try {
      const auth1 = await signInWithEmailAndPassword(auth, email, password);
      console.log(auth1)
      const userDoc = await getDoc(doc(db, 'usersList', username));
      if (userDoc.exists()) {
        setUser(userDoc.data());
      } else {
        setError('User document not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signIn, signOut };
}

// Main Component
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { user, loading, error, signIn, signOut } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn(email, password, username);
  };

  const handleSignOut = async () => {
    await signOut();
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const handleDeleteUser = () => {
    // NOTE: In a real app, you would call Firebase deleteUser here after reauthentication
    handleSignOut();
  };

  const themeClass = isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900';
  const inputClass = isDarkTheme ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300';

  return (
    <div className={`min-h-screen flex items-center justify-center ${themeClass}`}>
      <div className="w-full max-w-md p-8 rounded-xl shadow-md space-y-6 m-4">
        <div className="flex justify-end items-center gap-2">
          <Switch
            checked={isDarkTheme}
            onChange={() => setIsDarkTheme(!isDarkTheme)}
          />
          {isDarkTheme ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </div>

        {!user ? (
          <>
            <h1 className="text-3xl font-bold text-center">Sign In</h1>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className={inputClass}
              />
              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className={inputClass}
              />
              <Input
                id="username"
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className={inputClass}
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            {user.imageUrl && (
              <img src={user.imageUrl} alt="User" className="w-24 h-24 rounded-full mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-gray-500">{user.email}</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleSignOut}
                variant="outline"
                disabled={loading}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
              <Button
                onClick={handleDeleteUser}
                variant="destructive"
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Profile
              </Button>
            </div>
          </div>
        )}

        {error && (
          <p className={`mt-4 text-center ${isDarkTheme ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
