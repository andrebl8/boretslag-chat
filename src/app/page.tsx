import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ThreadList from "@/components/ThreadList";
import NewThreadForm from "@/components/NewThreadForm";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <NewThreadForm />
      </div>
      <ThreadList />
    </div>
  );
}
