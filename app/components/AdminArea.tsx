import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAdmin } from "../utils/adminContext";
import { toast } from "react-toastify";

export function AdminArea() {
  const [password, setPassword] = useState("");
  const { toggleAdmin } = useAdmin();

  const checkPassword = async () => {
    const res = await fetch("/api/auth/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (data.success) {
      toggleAdmin();
      toast.success("You have entered admin mode");
    } else {
      toast.error("Incorrect password.");
    }
  };

  return (
    <>
      <Input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter Password"
      ></Input>
      <Button
        type="submit"
        className=" bg-green-600 text-white font-semibold rounded-md shadow-md 
         hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 
        focus:ring-offset-2 active:bg-green-800 transition duration-200 mt-2"
        onClick={() => checkPassword()}
      >
        Submit
      </Button>
    </>
  );
}
