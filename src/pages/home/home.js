import React from 'react';
import './home.css';

const Home = () => {
  const projects = ["gml-luh-wae-a01-00002-waste-segmentation", "gml-luh-wae-a01-00002-impurity-detection"];

  return (
    <div className="home-container">

      <div className="home-content">
        <div className='content-header'>
          <span>Projects</span>
        </div>

        <div className='content-section'>
          {projects.map((project) => (
            <ProjectCard
              project={project}
            />
          ))}

        </div>

      </div>
    </div>
  );
};

export default Home;