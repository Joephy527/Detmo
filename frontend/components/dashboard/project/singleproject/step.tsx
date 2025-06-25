import type { FC } from 'react';
import { Check } from 'lucide-react';

interface Props {
    currentPhase?: string;
}

const Step: FC<Props> = ({ currentPhase = 'Execution' }) => {
    const phases = [
        'Initiation',
        'Planning',
        'Execution',
        'Control',
        'Closure',
    ];
    const currentPhaseIndex = phases.indexOf(currentPhase);

    return (
        <div className="pb-5 text-[20px] font-[700] text-[#121212] flex items-center xl:justify-between flex-wrap gap-3 gap-y-4">
            {phases.map((phase, index) => {
                // Determine if phase is completed, current, or upcoming
                const isCompleted = index < currentPhaseIndex;
                const isCurrent = index === currentPhaseIndex;
                const isUpcoming = index > currentPhaseIndex;

                // Set appropriate colors based on phase status
                const textColor = isCurrent
                    ? 'text-[#DA5777]'
                    : isUpcoming
                    ? 'text-[#CEEFFB]'
                    : 'text-black';
                const bgColor = isCurrent
                    ? 'bg-[#DA5777]'
                    : isUpcoming
                    ? 'bg-[#CEEFFB]'
                    : 'bg-[#7CC44E]';
                const lineColor = isUpcoming ? 'bg-[#CEEFFB]' : 'bg-[#7CC44E]';
                const fontWeight =
                    isCurrent || isUpcoming ? 'font-[700]' : 'font-[400]';

                return (
                    <div
                        key={phase}
                        className={`${textColor} flex items-center text-[15px] ${fontWeight} ${
                            index > 0 ? 'gap-20' : ''
                        }`}
                    >
                        {index > 0 && (
                            <div
                                className={`w-[40px] ${lineColor} h-[2px] hidden xl:inline-grid`}
                            />
                        )}
                        <div className="flex items-center">
                            <span
                                className={`flex justify-center items-center ${bgColor} size-6 rounded-full mr-3 text-white`}
                            >
                                {isCompleted ? (
                                    <Check
                                        color="#fff"
                                        size={18}
                                        strokeWidth={2.5}
                                    />
                                ) : (
                                    <span className="text-[18px] font-[700]">
                                        {index + 1}
                                    </span>
                                )}
                            </span>
                            {phase}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Step;
