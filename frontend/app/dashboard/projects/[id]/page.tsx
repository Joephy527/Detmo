import { FC } from 'react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Step from '@/components/dashboard/project/singleproject/step';
import Cards from '@/components/dashboard/project/singleproject/cards';
import Comments from '@/components/dashboard/project/singleproject/comments';
import ProjectDets from '@/components/dashboard/project/singleproject/projectdetails';
import SourcingTeam from '@/components/dashboard/project/singleproject/sourcingteam';
import RatingSummary from '@/components/dashboard/project/singleproject/ratingsumary';
import { getSourcingProjects } from '@/actions/projects';
import { getSupplierEvalutionsForProject } from '@/actions/supplier-evaluation';

interface Props {
    params: Promise<{ id: string }>;
}

const SingleProject: FC<Props> = async ({ params }) => {
    const { id } = await params;
    const response = await getSourcingProjects({
        project_id: id,
    });
    const supplier_evaluation_promise = getSupplierEvalutionsForProject(id);
    const project = response?.items[0];
    if (!project) return;
    return (
        <div className="bg-[#F6F6F6] p-4 lg:gap-6 lg:p-6 min-h-screen w-full">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            href="/"
                            className="text-muted-foreground/70"
                        >
                            Home
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            href="/dashboard/projects"
                            className="text-muted-foreground/70"
                        >
                            All Projects
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[16px] font-[400]">
                            {project.Name}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <h1 className="mt-4 mb-4 text-[32px] font-[700]">{project.Name}</h1>

            <main className="bg-transparent w-full h-full grid  grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-[12px] bg-white p-4 py-6 sm:col-span-2 xl:px-9">
                    <Step currentPhase={project?.Phase} />
                    <Cards
                        project={{
                            Saving: project.Saving,
                            ProjectType: project.ProjectType,
                            Commodity: project.Commodity,
                            StartDate: project.StartDate,
                            EndDate: project.EndDate,
                        }}
                    />
                </div>
                <div>
                    <ProjectDets
                        Commodity={project.Commodity}
                        Project_id={project.SourcingProjectID}
                    />
                    <SourcingTeam
                        project={{
                            SourcingPmEmail: project.SourcingPmEmail,
                            SelectedSupplierPmEmail:
                                project.SelectedSupplierPmEmail,
                            ProjectSponserEmail: project.ProjectSponserEmail,
                            ScmManagerEmail: project.ScmManagerEmail,
                            BuyerEmail: project.BuyerEmail,
                            FinancePocEmail: project.FinancePocEmail,
                            SourcingProjectID: project.SourcingProjectID,
                        }}
                    />
                    <RatingSummary
                        project_id={project.SourcingProjectID}
                        supplier_evaluation_promise={
                            supplier_evaluation_promise
                        }
                    />
                </div>

                <div className="sm:h-max">
                    <Comments SourcingProjectId={project.SourcingProjectID} />
                </div>
            </main>
        </div>
    );
};

export default SingleProject;
