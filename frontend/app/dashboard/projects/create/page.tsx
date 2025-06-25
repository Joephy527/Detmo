import Createprojectform from '@/components/dashboard/project/createprojectform';
import { FC } from 'react';

interface Props {
    searchParams: {
        CommodityName?: string;
        CommodityPartDescription?: string;
    };
}

const CreateProject: FC<Props> = ({ searchParams }) => {
    return (
        <section className="bg-[#F6F6F6]">
            <div className="p-4 md:px-6">
                <div className="bg-[#F6F6F6] pt-5 pb-6 max-w-[1400px] mx-auto">
                    <h1 className="text-[25px] md:text-[28px] lg:text-[32px] font-[700]">
                        Create new sourcing project
                    </h1>
                </div>
            </div>
            <Createprojectform {...searchParams} />
        </section>
    );
};

export default CreateProject;
