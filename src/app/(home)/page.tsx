import { getProjects } from "@/lib/projects";
import { HomeContent } from "./components/HomeContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getProjects();
  return <HomeContent projects={projects} />;
}
