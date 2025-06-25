import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectType } from '@/lib/types';

interface Props {
    project: Pick<
        ProjectType,
        'Saving' | 'ProjectType' | 'Commodity' | 'StartDate' | 'EndDate'
    >;
}
const Cards: FC<Props> = ({ project }) => {
    const { Saving, ProjectType, Commodity, StartDate, EndDate } = project;
    return (
        <div className=" grid grid-cols-1 sm:grid-cols-3 gap-5 lg:grid-cols-4">
            <Card className="w-full border-0 bg-[#EFFAFE] rounded-[8px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[15px] font-[500] text-[#4EA3C2]">
                        Savings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-[16px] sm:text-[18px] font-[700] text-[#3A7A91]">
                        ${Saving.toFixed(2)}
                    </p>
                </CardContent>
            </Card>
            <Card className="w-full border-0 bg-[#F6F6F6] rounded-[8px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[15px] font-[500] text-[#8A8A8A]">
                        Project type
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-[16px] sm:text-[18px] font-[700] text-[#3B3C41]">
                        {ProjectType}
                    </p>
                </CardContent>
            </Card>
            <Card className="w-full border-0 bg-[#F6F6F6] rounded-[8px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[15px] font-[500] text-[#8A8A8A]">
                        Commodity name
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-[16px] sm:text-[18px] font-[700] text-[#3B3C41]">
                        {Commodity.CommodityName}
                    </p>
                </CardContent>
            </Card>
            <Card className="w-full border-0 bg-[#F6F6F6] rounded-[8px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[15px] font-[500] text-[#8A8A8A]">
                        Project date
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-[16px] sm:text-[18px] font-[700] text-[#3B3C41]">
                        {StartDate} - {EndDate}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default Cards;
