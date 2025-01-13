import React from "react";
import { signOut, User } from "firebase/auth";
import { auth } from "@/firebase";
import { Button } from "@/components/ui/button";

interface SignOutProps {
  setUser: (user: User | null) => void;
}

const SignOut: React.FC<SignOutProps> = ({ setUser }) => {
  const handleSignOut = async () => {
    try {
      const result = await signOut(auth);
      console.log(result);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Button
      className={`bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-md mt-2
             hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
             focus:ring-offset-2 active:bg-blue-800 transition duration-200`}
      onClick={handleSignOut}
      style={{ marginLeft: 2, marginRight: 2 }}
    >
      Sign Out
    </Button>
  );
};

export default SignOut;
