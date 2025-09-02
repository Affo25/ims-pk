"use client";

import { useState } from "react";
// Removed server action import - using API route instead
// import {
//   signInUser,
//   //  getUser, signUpUser 
// } from "@/lib/actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { logger, isEmail } from "@/lib/utils";

const SigninForm = () => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [initializingUsers, setInitializingUsers] = useState(false);

  const onInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // const createUser = async () => {
  //   const response = await signUpUser();
  //   console.log(response);
  // }

  const handleSignin = async (e) => {
    try {
      e.preventDefault();

      if (!formData.email) {
        toast.error("Email cannot be empty.");
        return;
      }

      if (!isEmail(formData.email)) {
        toast.error("Please enter a valid email.");
        return;
      }

      if (!formData.password) {
        toast.error("Password cannot be empty.");
        return;
      }

      setWaiting(true);
      
      try {
        const response = await fetch("/api/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        setWaiting(false);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          logger("handleSignin()", `HTTP ${response.status}: ${errorData.message || 'Unknown error'}`);
          toast.error(errorData.message || "Email address or password is incorrect.");
          return;
        }

        const result = await response.json();

        if (result.status === "ERROR") {
          logger("handleSignin()", result.message || "Unknown error");
          toast.error(result.message || "Email address or password is incorrect.");
          return;
        }

        if (result.status === "OK") {
          toast.success("Signed in successfully.");
          
          // Store user info and session token locally
          if (result.data?.user) {
            localStorage.setItem("user_data", JSON.stringify(result.data.user));
          }
          
          if (result.data?.session_token) {
            localStorage.setItem("session_token", result.data.session_token);
            // Also set as cookie on client side for fallback
            document.cookie = `session_token=${result.data.session_token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
          }
          
          // Add a small delay to ensure cookie is set before redirect
          setTimeout(() => {
            router.push("/dashboard");
          }, 100);
          return;
        }

        // Fallback for unexpected response format
        logger("handleSignin()", "Unexpected response format:", result);
        toast.error("Unexpected response from server.");

      } catch (networkError) {
        setWaiting(false);
        logger("handleSignin() - Network Error", networkError);
        toast.error("Network error. Please check your connection and try again.");
      }

    } catch (error) {
      setWaiting(false);
      logger("handleSignin() - General Error", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const initializeUsers = async () => {
    try {
      setInitializingUsers(true);
      const response = await fetch("/api/init-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const result = await response.json();
      
      if (result.status === "OK") {
        toast.success("Test users initialized successfully!");
      } else {
        toast.error(result.message || "Failed to initialize users");
      }
    } catch (error) {
      toast.error("Network error occurred");
    } finally {
      setInitializingUsers(false);
    }
  };

  return (
    <form onSubmit={handleSignin}>
      
      
      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email address
        </label>
        <input type="email" id="email" autoComplete="off" className="form-control" value={formData.email} onChange={onInputChange} />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input type="password" id="password" autoComplete="off" className="form-control" value={formData.password} onChange={onInputChange} />
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
