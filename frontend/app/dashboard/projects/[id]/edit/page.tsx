import { FC, Suspense } from 'react';

import { getSourcingProjects } from '@/actions/projects';
import Editprojectform from '@/components/dashboard/project/editprojectform';
import { EditProjectLoading } from '../loading';

interface Props {
    params: Promise<{ id: string }>;
}

const EditProject: FC<Props> = async ({ params }) => {
    const { id } = await params;
    const project_promise = getSourcingProjects({ project_id: id, limit: 1 });
    return (
        <section className="bg-[#F6F6F6]">
            <div className="p-4 md:px-6">
                <div className="bg-[#F6F6F6] pt-5 pb-6 max-w-[1400px] mx-auto">
                    <h1 className="text-[25px] md:text-[28px] lg:text-[32px] font-[700]">
                        Edit project details
                    </h1>
                </div>
            </div>
            <Suspense fallback={<EditProjectLoading />}>
                <Editprojectform
                    project_id={id}
                    project_promise={project_promise}
                />
            </Suspense>
        </section>
    );
};

export default EditProject;
