import { ProjectType } from '@/lib/types';
import { PencilLine } from 'lucide-react';
import Link from 'next/link';
import { FC } from 'react';

interface Props {
    project: Pick<
        ProjectType,
        | 'SourcingPmEmail'
        | 'SelectedSupplierPmEmail'
        | 'ProjectSponserEmail'
        | 'ScmManagerEmail'
        | 'BuyerEmail'
        | 'FinancePocEmail'
        | 'SourcingProjectID'
    >;
}
const SourcingTeam: FC<Props> = ({ project }) => {
    const {
        SourcingPmEmail,
        SelectedSupplierPmEmail,
        ProjectSponserEmail,
        ScmManagerEmail,
        BuyerEmail,
        FinancePocEmail,
        SourcingProjectID,
    } = project;
    return (
        <div className="rounded-[12px] bg-white p-4 md:p-5 lg:p-6 xl:px-9 mb-4">
            <h1 className="pb-6 text-[20px] font-[700] text-[#121212] flex items-center justify-between">
                Sourcing Team{' '}
                <span className="ml-3">
                    {' '}
                    <Link
                        href={`/dashboard/projects/${SourcingProjectID}/edit`}
                    >
                        <PencilLine
                            className="text-primary"
                            strokeWidth={'1'}
                        />
                    </Link>
                </span>
            </h1>
            <hr />
            <div className="pt-6">
                <div className="flex justify-between items-center flex-wrap mb-6 gap-7 sm:gap-0">
                    <h2 className="text-[15px] font-[500] text-[#8A8A8A] sm:w-[35%]">
                        Sourcing PM
                    </h2>
                    <p className="sm:w-[65%] sm:text-left text-[15px] font-[500] text-[#121212] flex-shrink-0">
                        {SourcingPmEmail}
                    </p>
                </div>
                <div className="flex justify-between items-center flex-wrap mb-6 gap-7 sm:gap-0">
                    <h2 className="text-[15px] font-[500] text-[#8A8A8A] sm:w-[35%]">
                        Selected supplier PM
                    </h2>
                    <p className="sm:w-[65%] sm:text-left text-[15px] font-[500] text-[#121212] flex-shrink-0">
                        {SelectedSupplierPmEmail}
                    </p>
                </div>
                <div className="flex justify-between items-center flex-wrap mb-6 gap-7 sm:gap-0">
                    <h2 className="text-[15px] font-[500] text-[#8A8A8A] sm:w-[35%]">
                        Project Sponsor
                    </h2>
                    <p className="sm:w-[65%] sm:text-left text-[15px] font-[500] text-[#121212] flex-shrink-0">
                        {ProjectSponserEmail}
                    </p>
                </div>
                <div className="flex justify-between items-center flex-wrap mb-6 gap-7 sm:gap-0">
                    <h2 className="text-[15px] font-[500] text-[#8A8A8A] sm:w-[35%]">
                        SCM manager
                    </h2>
                    <p className="sm:w-[65%] sm:text-left text-[15px] font-[500] text-[#121212] flex-shrink-0">
                        {ScmManagerEmail}
                    </p>
                </div>
                <div className="flex items-center justify-between flex-wrap mb-6 gap-7 sm:gap-0">
                    <h2 className="text-[15px] font-[500] text-[#8A8A8A] sm:w-[35%]">
                        Buyer
                    </h2>
                    <p className="sm:w-[65%] sm:text-left text-[15px] font-[500] text-[#121212] flex-shrink-0">
                        {BuyerEmail}
                    </p>
                </div>
                <div className="flex  justify-between items-center flex-wrap mb-6 gap-7 sm:gap-0">
                    <h2 className="text-[15px] font-[500] text-[#8A8A8A] sm:w-[35%]">
                        Finance POC
                    </h2>
                    <p className="sm:w-[65%] sm:text-left text-[15px] font-[500] text-[#121212] flex-shrink-0">
                        {FinancePocEmail}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SourcingTeam;
