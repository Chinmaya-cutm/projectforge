function ProjectCard({ project }) {
  return (
    <div className="card">
      <h3>{project.name}</h3>

      <p>{project.description}</p>
    </div>
  );
}

export default ProjectCard;