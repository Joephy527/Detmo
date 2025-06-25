import React from 'react';

import { getSourcingProjects } from '@/actions/projects';
import Projects from './projects';

const page = async () => {
    const projects = await getSourcingProjects({});

    if (!projects) return;

    return <Projects projects={projects.items} />;
};

export default page;
