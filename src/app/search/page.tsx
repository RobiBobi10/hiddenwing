import { redirect } from "next/navigation";

// Search now lives on the home page (/). Keep this path working by redirecting.
export default function SearchRedirect() {
  redirect("/");
}
