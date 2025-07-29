import { countryNameToISOMap } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SeeShortCodes = () => {
  const sortedCountries = Object.entries(countryNameToISOMap).sort(
    ([countryA], [countryB]) => countryA.localeCompare(countryB),
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs px-2 py-1 focus:outline-none h-auto border rounded-md border-primary text-primary">
          Country Codes
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Country Codes Reference</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {sortedCountries.map(([country, code]) => (
            <div
              key={code}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
            >
              <span className="font-medium min-w-[180px]">{country}</span>
              <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                {code}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeeShortCodes;
