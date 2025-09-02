import { redirect } from "next/navigation";

const Root = () => {
  // Middleware will handle redirect logic
  redirect("/dashboard");
};

export default Root;