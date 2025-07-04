import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export default function CardHeaders({
  Icon,
  title,
  description,
  count,
  countSymbol,
  withSymbol,
}: {
  Icon: JSX.Element;
  title: string;
  description: string;
  count?: number;
  countSymbol?: string;
  withSymbol?: boolean;
}) {
  return (
    <Card className="w-full border-0 shadow-0 py-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#8A8A8A]">
          {title}
        </CardTitle>
        {/* <Icon className="h-4 w-4 text-muted-foreground" /> */}
        {Icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-[700] text-[#6649B6]">
          {withSymbol && countSymbol} {count}
        </div>
        <p className="text-xs text-muted-foreground hidden">
          +180.1% from last month
        </p>
      </CardContent>
    </Card>
  );
}
