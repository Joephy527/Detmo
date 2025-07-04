import { format, subDays } from "date-fns";
import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const searchParams = {
  startDate: parseAsString.withDefault(
    format(subDays(new Date(), 360), "yyyy-MM-dd"),
  ),
  endDate: parseAsString.withDefault(format(new Date(), "yyyy-MM-dd")),
};

export const searchParamOption = {
  shallow: false,
  clearOnDefault: true,
};

export const searchParamsCache = createSearchParamsCache({
  ...searchParams,
});

export type ParsedSearchParams = ReturnType<typeof searchParamsCache.parse>;
