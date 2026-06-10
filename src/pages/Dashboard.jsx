import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import ProjectForm from "../components/ProjectForm";
import ProjectCard from "../components/ProjectCard";

function Dashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("projects")) || [];

   setProjects(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "projects",
      JSON.stringify(projects)
    );
  }, [projects]);

  const addProject = (project) => {
    setProjects([...projects, project]);
  };

  return (
    <div className="container">
      <Sidebar />

      <div className="content">
        <h1>Dashboard</h1>

        <ProjectForm addProject={addProject} />

        <div className="cards">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;