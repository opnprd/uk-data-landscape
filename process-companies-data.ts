import { readTXT, writeCSV, readCSV, writeJSON } from 'https://deno.land/x/flat@0.0.11/mod.ts'

const filename = Deno.args[0];
const outputFilename = filename.replace(/\..+?$/, '.geojson');
const text = await readTXT(filename);

// Strip blank lines
const cleanedText = text
  .replace(/^(.*\n)*---.*\n/, '');

await writeCSV(filename, cleanedText);

console.log({ filename, outputFilename, before: text.length, after: cleanedText.length });

const locatedCompanies = (company: any) => company['UK Postcode'];
const splitPostcodes = (list: any[], company: any) => ([
  ...list,
  ...company['UK Postcode']
    .split(',')
    .map((postcode: string) => ({
      ...company,
      'UK Postcode': postcode,
    }))
]);

type PostcodeLookupResponse = {
  postcode: string;
  longitude: string;
  latitude: string;
  adminDistrict: string;
  msoa: string;
  lsoa: string;
}

async function bulkPostcodeLookup(postcodes: any[]) {
  const batches = [];
  const batchSize = 100;
  for (let i = 0; i < postcodes.length; i += batchSize) {
    batches.push(postcodes.slice(i, i + batchSize));
  }

  const postcodeApiCall = async (postcodes: any): Promise<any[]> => fetch('https://api.postcodes.io/postcodes/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      postcodes
    }),
  })
    .then((response: any) => response.json())
    .then((json: any) => json.result);

  return (await Promise.all(batches.map(postcodeApiCall))).flat()
    .map((result: any) => {
      if (!Boolean(result.result)) {
        console.error(`Postcode ${result.query} not found`);
        return;
      }

      return {
        postcode: result.result.postcode,
        latitude: result.result.latitude,
        longitude: result.result.longitude,
        adminDistrict: result.result.codes.admin_district,
        msoa: result.result.codes.msoa,
        lsoa: result.result.codes.lsoa,
      }
    })
    .filter(Boolean) as PostcodeLookupResponse[];
}

const lookupLocations = async (companyData: any) => {
  const postcodes = [
    ...(new Set(companyData.map((company: any) => company['UK Postcode'])))
  ];
  const locations = await bulkPostcodeLookup(postcodes);
  return companyData.map((company: any) => {
    const geoData = locations
      .find((location: any) => location.postcode === company['UK Postcode']);
    if (geoData == undefined) return;
    const { longitude, latitude, adminDistrict, msoa, lsoa } = geoData;
    return {
      ...company,
      coordinates: [longitude, latitude],
      adminDistrict,
      msoa,
      lsoa,
    }
  }).filter(Boolean);
};

const createGeoJsonFeature = (company: any) => ({
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: company.coordinates
  },
  properties: {
    name: company['Organisation'],
    category: company['Category (Users, Enablers, Stewards)'],
    preliminary_category: company['Preliminary Category'],
    admin_district: company.adminDistrict,
    msoa: company.msoa,
    lsoa: company.lsoa,
  }
});

const companyData = (await readCSV(filename))
  .filter(locatedCompanies)
  .reduce(splitPostcodes, []);

const geoJsonData = {
  type: 'FeatureCollection',
  features: (await lookupLocations(companyData)).map(createGeoJsonFeature)
};

await writeJSON(outputFilename, geoJsonData);
