"use client";

import { useState } from "react";
import {
  signInUser,
  //  getUser, signUpUser 
} from "@/lib/actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { logger, isEmail } from "@/lib/utils";

const SigninForm = () => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.id]: e.target.value });
  };

  // const createUser = async () => {
  //   const response = await signUpUser();
  //   console.log(response);
  // }

  const handleSignin = async (e) => {
    try {
      e.preventDefault();

      if (!user.email) {
        toast.error("Email cannot be empty.");
        return;
      }

      if (!isEmail(user.email)) {
        toast.error("Please enter a valid email.");
        return;
      }

      if (!user.password) {
        toast.error("Password cannot be empty.");
        return;
      }

      setWaiting(true);
      const response = await signInUser(user);
      setWaiting(false);

      if (response.status === "ERROR") {
        logger("handleSignin()", response.message);
        toast.error("Email address or password is incorrect.");
        return;
      }

      toast.success("Signed in successfully.");
      // const result = await getUser();
      // if (
      //   result.data.areas.includes("international") &&
      //   result.data.country !== "UAE"
      // ) {
      //   router.push("/sales/international");
      // } else {
      router.push("/dashboard");
      // }

    } catch (error) {
      logger("handleSignin()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSignin}>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email address
        </label>
        <input type="email" id="email" autoComplete="off" className="form-control" value={user.email} onChange={onInputChange} />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input type="password" id="password" autoComplete="off" className="form-control" value={user.password} onChange={onInputChange} />
      </div>
      <button type="submit" disabled={waiting} className="btn btn-primary w-100 py-8 mb-4 rounded-2">
        {waiting ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
};

export default SigninForm;
