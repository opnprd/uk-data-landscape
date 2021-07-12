import { readTXT, writeCSV, readCSV, writeJSON } from 'https://deno.land/x/flat@0.0.11/mod.ts'

const filename = Deno.args[0];

const text = await readTXT(filename);

// Strip blank lines
const cleanedText = text.split(/[\r\n]+/).filter((line: string) => line.replace(/,/g, '').length > 0).join('\n');

await writeCSV(filename, cleanedText);

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

async function bulkPostcodeLookup(postcodes: any[]) {
  return fetch('https://api.postcodes.io/postcodes/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      postcodes
    }),
  })
    .then((response: any) => response.json())
    .then((json: any) => json.result
      .map((result: any) => ({
        postcode: result.result.postcode,
        latitude: result.result.latitude,
        longitude: result.result.longitude,
        adminDistrict: result.result.codes.admin_district,
        msoa: result.result.codes.msoa,
        lsoa: result.result.codes.lsoa,
      })));
}

const lookupLocations = async (companyData: any) => {
  const postcodes = [
    ...(new Set(companyData.map((company: any) => company['UK Postcode'])))
  ];
  const locations = await bulkPostcodeLookup(postcodes);

  return companyData.map((company: any) => {
    const { longitude, latitude, adminDistrict, msoa, lsoa } = locations
      .find((location: any) => location.postcode === company['UK Postcode'])
    return {
      ...company,
      coordinates: [ longitude, latitude ],
      adminDistrict,
      msoa,
      lsoa,
    }
  })
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

await writeJSON('uk-landscape-non-commercial.geojson', geoJsonData);
