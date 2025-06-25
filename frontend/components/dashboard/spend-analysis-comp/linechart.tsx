'use client';
import { SpendingByMonthType } from '@/lib/types';
import { FC, use } from 'react';
import {
    Line,
    LineChart,
    Tooltip,
    XAxis,
    YAxis,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';

interface props {
    spending_by_month_promise: Promise<SpendingByMonthType[] | null>;
}
const Linechat: FC<props> = ({ spending_by_month_promise }) => {
    const spending_by_month = use(spending_by_month_promise);

    if (!spending_by_month) return;

    const rangeData = spending_by_month.map((data) => {
        return {
            name: data['Month Year'],
            amount: data['Total Spend'],
        };
    });
    const tickFormater = (number: number) => {
        if (number > 1000000000) {
            return (number / 1000000000).toString() + 'B';
        } else if (number > 1000000) {
            return (number / 1000000).toString() + 'M';
        } else if (number > 1000) {
            return (number / 1000).toString() + 'K';
        } else {
            return number.toString();
        }
    };

    return (
        <div className="h-[350px] w-full bg-white rounded-[12px]">
            <ResponsiveContainer width={'100%'} height={'100%'}>
                <LineChart
                    data={rangeData}
                    margin={{ top: 5, bottom: 30, right: 40, left: 15 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#BFBFBF', fontSize: '14px' }}
                        stroke="#BFBFBF"
                    />
                    <YAxis
                        stroke="#BFBFBF"
                        tick={{ fill: '#BFBFBF', fontSize: '15px' }}
                        dataKey={'amount'}
                        tickFormatter={(value) =>
                            new Intl.NumberFormat('en-US', {
                                notation: 'compact',
                                compactDisplay: 'short',
                            }).format(value)
                        }
                    />
                    <Tooltip />
                    <Line
                        dataKey="amount"
                        stroke="#6649B6"
                        strokeWidth={1.5}
                        type={'linear'}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Linechat;
