import React from "react";
import { signInWithPopup, User } from "firebase/auth";
import { auth, provider } from "@/firebase";

interface SignInProps {
  setUser: (user: User | null) => void;
}

const SignIn: React.FC<SignInProps> = ({ setUser }) => {
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <button
        onClick={handleSignIn}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="w-6 h-6"
        >
          <path
            fill="#fbc02d"
            d="M43.6 20.7h-3.4v-.1H24v7.2h11.2C33.2 32 29.2 34.7 24 34.7c-6 0-10.9-4.1-12.6-9.5l-.1-.4-7.2 5.6.2.5c2.7 6.6 9.1 11.1 16.7 11.1 8.9 0 16.4-6.4 17.9-15 .2-1 .3-2 .3-3.2 0-1.1-.1-2.2-.4-3.1z"
          />
          <path
            fill="#e53935"
            d="M6.3 14.6l6.1 4.7c1.6-4.9 6.3-8.4 11.7-8.4 3.1 0 5.9 1.1 8.1 3l6.2-6.2C34.5 4.8 29.6 2.8 24 2.8c-7.6 0-14 4.5-16.7 11.1l-.2.7z"
          />
          <path
            fill="#4caf50"
            d="M24 44c5.4 0 10.3-2.1 13.9-5.5l-6.4-5.2c-2.1 1.4-4.7 2.2-7.5 2.2-5.3 0-9.8-3.4-11.5-8l-.6.1-7 5.5-.2.5C8.2 40 15.7 44 24 44z"
          />
          <path
            fill="#1565c0"
            d="M43.6 20.7H24v7.2h11.2c-1.1 3.1-3.3 5.7-6.2 7.4l6.4 5.2c.4-.4 7.6-4.4 7.6-12.6 0-1.1-.1-2.2-.4-3.1z"
          />
        </svg>
        Sign in with Google
      </button>
    </div>
  );
};

export default SignIn;
