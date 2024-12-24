'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDataObj, setUserDataObj] = useState(null);
  const [loading, setLoading] = useState(true);

  //* Auth handlers
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUserDataObj(null);
    setCurrentUser(null);
    return auth.signOut();
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        //* set user to local context state
        setLoading(true);
        setCurrentUser(user);
        if (!user) {
          console.log('No user found');
          setLoading(false);
          return;
        }
        //* if user exists, get user data from firestore
        console.log('Fetching user data from firestore...');
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        let firebaseData = {};
        if (docSnap.exists()) {
          console.log('Found user data');
          firebaseData = docSnap.data();
          console.log('firebaseData:', firebaseData);
        }
        setUserDataObj(firebaseData);
      } catch (error) {
        console.error("ERROR: ",error.message);
      } finally {
        setLoading(false);
      }
      // setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  //* inside value object, we can put any data that we want to globally share
  const value = {
    currentUser,
    userDataObj,
    setUserDataObj,
    signup,
    login,
    logout,
    loading,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
