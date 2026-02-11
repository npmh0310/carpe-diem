import { getProjects } from "@/lib/projects";
import { HomeContent } from "./components/HomeContent";

export default async function Home() {
  const projects = await getProjects();
  return <HomeContent projects={projects} />;
}
