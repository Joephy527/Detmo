import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { CompanyDetailsType, UserType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Country name to ISO code mapping
const countryNameToISOMap = {
  "Afghanistan": "AFG",
  "Angola": "AGO",
  "Albania": "ALB",
  "United Arab Emirates": "ARE",
  "Argentina": "ARG",
  "Armenia": "ARM",
  "Antarctica": "ATA",
  "French Southern and Antarctic Lands": "ATF",
  "Austria": "AUT",
  "Azerbaijan": "AZE",
  "Burundi": "BDI",
  "Belgium": "BEL",
  "Benin": "BEN",
  "Burkina Faso": "BFA",
  "Bangladesh": "BGD",
  "Bulgaria": "BGR",
  "Bahamas": "BHS",
  "Bosnia and Herzegovina": "BIH",
  "Belarus": "BLR",
  "Belize": "BLZ",
  "Bolivia": "BOL",
  "Brunei": "BRN",
  "Bhutan": "BTN",
  "Botswana": "BWA",
  "Central African Republic": "CAF",
  "Canada": "CAN",
  "Switzerland": "CHE",
  "Chile": "CHL",
  "China": "CHN",
  "Ivory Coast": "CIV",
  "Côte d'Ivoire": "CIV",
  "Cameroon": "CMR",
  "Congo": "COG",
  "Republic of the Congo": "COG",
  "Colombia": "COL",
  "Costa Rica": "CRI",
  "Cuba": "CUB",
  "Cyprus": "CYP",
  "Czech Republic": "CZE",
  "Czechia": "CZE",
  "Germany": "DEU",
  "Djibouti": "DJI",
  "Denmark": "DNK",
  "Dominican Republic": "DOM",
  "Algeria": "DZA",
  "Ecuador": "ECU",
  "Egypt": "EGY",
  "Eritrea": "ERI",
  "Spain": "ESP",
  "Estonia": "EST",
  "Ethiopia": "ETH",
  "Finland": "FIN",
  "Fiji": "FJI",
  "Falkland Islands": "FLK",
  "France": "FRA",
  "Gabon": "GAB",
  "United Kingdom": "GBR",
  "Georgia": "GEO",
  "Ghana": "GHA",
  "Guinea": "GIN",
  "Gambia": "GMB",
  "Guinea-Bissau": "GNB",
  "Equatorial Guinea": "GNQ",
  "Greece": "GRC",
  "Guatemala": "GTM",
  "Guyana": "GUY",
  "Honduras": "HND",
  "Croatia": "HRV",
  "Haiti": "HTI",
  "Hungary": "HUN",
  "Indonesia": "IDN",
  "India": "IND",
  "Ireland": "IRL",
  "Iran": "IRN",
  "Iraq": "IRQ",
  "Iceland": "ISL",
  "Israel": "ISR",
  "Italy": "ITA",
  "Jamaica": "JAM",
  "Jordan": "JOR",
  "Japan": "JPN",
  "Kazakhstan": "KAZ",
  "Kenya": "KEN",
  "Kyrgyzstan": "KGZ",
  "Cambodia": "KHM",
  "South Korea": "KOR",
  "Kosovo": "OSA",
  "Kuwait": "KWT",
  "Laos": "LAO",
  "Lebanon": "LBN",
  "Liberia": "LBR",
  "Libya": "LBY",
  "Sri Lanka": "LKA",
  "Lesotho": "LSO",
  "Lithuania": "LTU",
  "Luxembourg": "LUX",
  "Latvia": "LVA",
  "Morocco": "MAR",
  "Moldova": "MDA",
  "Madagascar": "MDG",
  "Mexico": "MEX",
  "North Macedonia": "MKD",
  "Macedonia": "MKD",
  "Mali": "MLI",
  "Myanmar": "MMR",
  "Burma": "MMR",
  "Montenegro": "MNE",
  "Mongolia": "MNG",
  "Mozambique": "MOZ",
  "Mauritania": "MRT",
  "Malawi": "MWI",
  "Malaysia": "MYS",
  "Namibia": "NAM",
  "New Caledonia": "NCL",
  "Niger": "NER",
  "Nigeria": "NGA",
  "Nicaragua": "NIC",
  "Netherlands": "NLD",
  "Norway": "NOR",
  "Nepal": "NPL",
  "New Zealand": "NZL",
  "Oman": "OMN",
  "Pakistan": "PAK",
  "Panama": "PAN",
  "Peru": "PER",
  "Philippines": "PHL",
  "Papua New Guinea": "PNG",
  "Poland": "POL",
  "Puerto Rico": "PRI",
  "Portugal": "PRT",
  "Paraguay": "PRY",
  "Qatar": "QAT",
  "Romania": "ROU",
  "Russia": "RUS",
  "Rwanda": "RWA",
  "Western Sahara": "ESH",
  "Saudi Arabia": "SAU",
  "Sudan": "SDN",
  "South Sudan": "SDS",
  "Senegal": "SEN",
  "Solomon Islands": "SLB",
  "Sierra Leone": "SLE",
  "El Salvador": "SLV",
  "Somalia": "SOM",
  "Serbia": "SRB",
  "Suriname": "SUR",
  "Slovakia": "SVK",
  "Slovenia": "SVN",
  "Eswatini": "SWZ",
  "Swaziland": "SWZ",
  "Syria": "SYR",
  "Chad": "TCD",
  "Togo": "TGO",
  "Thailand": "THA",
  "Tajikistan": "TJK",
  "Turkmenistan": "TKM",
  "East Timor": "TLS",
  "Timor-Leste": "TLS",
  "Trinidad and Tobago": "TTO",
  "Tunisia": "TUN",
  "Turkey": "TUR",
  "Türkiye": "TUR",
  "Taiwan": "TWN",
  "Tanzania": "TZA",
  "Uganda": "UGA",
  "Ukraine": "UKR",
  "Uruguay": "URY",
  "United States": "USA",
  "USA": "USA",
  "US": "USA",
  "Uzbekistan": "UZB",
  "Venezuela": "VEN",
  "Vietnam": "VNM",
  "Vanuatu": "VUT",
  "Palestine": "PSE",
  "Yemen": "YEM",
  "South Africa": "ZAF",
  "Zambia": "ZMB",
  "Zimbabwe": "ZWE"
};


export function getCountryCode(countryName: string) {
  // Normalize the country name - trim whitespace and convert to lowercase
  const normalizedName = countryName.trim().toLowerCase();

  // Check for exact match (case insensitive)
  for (const [name, code] of Object.entries(countryNameToISOMap)) {
    if (name.toLowerCase() === normalizedName) {
      return code;
    }
  }

  // If no exact match, try to find a partial match
  for (const [name, code] of Object.entries(countryNameToISOMap)) {
    if (name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(name.toLowerCase())) {
      return code;
    }
  }

  // No match found
  return null;
}

export function getChangedValues<T extends object>(original: T, updated: Partial<T>): Partial<T> {
  const changes: Partial<T> = {};

  for (const key in updated) {
    if (updated.hasOwnProperty(key)) {
      if (
        updated[key] !== original[key] &&
        JSON.stringify(updated[key]) !== JSON.stringify(original[key])
      ) {
        changes[key] = updated[key];
      }
    }
  }

  return changes;
}

export function getMatchingCompaniesByEmailDomain(user: Pick<UserType, 'Email'>, companies: CompanyDetailsType[]): CompanyDetailsType[] {
  const userDomain = user.Email.split('@')[1]?.toLowerCase();

  if (!userDomain) return [];

  return companies.filter(company => {
    const companyDomain = company.Email.split('@')[1]?.toLowerCase();
    return companyDomain === userDomain;
  });
}
