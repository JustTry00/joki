import { redirect } from "next/navigation";
import { auth } from "@/auth";
import HomePage from "@/components/dashboard/hero";

export default async function DashboardPage() {
  const session = await auth();

  if (session?.user.role == "user") {
    redirect("/dashboard");
  } 
  if (session?.user.role == "admin") {
    redirect("/admin");
  } 

  return <HomePage />;
}