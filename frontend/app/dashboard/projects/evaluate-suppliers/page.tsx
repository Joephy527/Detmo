import { FC } from 'react';

import Evaluate from './evaluate-suppliers';
import { getSupplierEvalutionsForProject } from '@/actions/supplier-evaluation';
import { getSourcingProjects } from '@/actions/projects';

interface Props {
    searchParams: any;
}

const page: FC<Props> = async ({ searchParams }) => {
    const project_id = searchParams.project_id;

    const project = (await getSourcingProjects({ project_id }))?.items[0];
    const supplier_evaluation_data = await getSupplierEvalutionsForProject(
        project_id
    );
    if (!project) return;
    if (!supplier_evaluation_data) return;

    return (
        <Evaluate
            project={project}
            supplier_evaluation_data={supplier_evaluation_data.items}
        />
    );
};

export default page;
