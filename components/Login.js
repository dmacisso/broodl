'use client';
import { Fugaz_One } from 'next/font/google';
import Button from './Button';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const fugaz = Fugaz_One({ subsets: ['latin'], weight: ['400'] });

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  const { signup, login } = useAuth();

  async function handleSubmit() {
    if (!email || !password || password.length < 6) return;

    setAuthenticating(true);
    try {
      if (isRegistering) {
        // register
        console.log('Registering a new user...');
        await signup(email, password);
      } else {
        // login
        console.log('Logging in existing user ...');
        await login(email, password);
      }
    } catch (error) {
      console.error('You Failed to login/register: ', error.message);
    } finally {
      setAuthenticating(false); // reset the state
    }
  }

  return (
    <div className="flex flex-col flex-1 justify-center items-center gap-4">
      <h3
        className={
          'text-4xl sm:text-5xl md:text-6xl textGradient ' + fugaz.className
        }
      >
        {isRegistering ? 'Register' : 'Login'}{' '}
      </h3>
      <p>You&#39;re one step away</p>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full max-w-[400px] mx-auto px-3 duration-200 hover:border-indigo-600 focus:border-indigo-600 py-2 sm:py-3 border border-solid border-indigo-400 rounded-full outline-none"
        type="email"
        placeholder="Email"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full max-w-[400px] mx-auto px-3 duration-200 hover:border-indigo-600 focus:border-indigo-600 py-2 sm:py-3 border border-solid border-indigo-400 rounded-full outline-none"
        type="password"
        placeholder="Password"
      />
      {/* MARK: Buttons */}
      <div className="max-w-[400px] w-full mx-auto">
        <Button clickHandler={handleSubmit} text={authenticating ? 'Submitting' : 'Submit'} full />
      </div>
      <p className="text-center">
        {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-indigo-600"
        >
          {isRegistering ? 'Sign in' : 'Sign up'}
        </button>{' '}
      </p>
    </div>
  );
}
