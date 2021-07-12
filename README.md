# UK Data Landscape

This repository contains the result of an attempt to identify the non-commercial / government components
of the UK Data Infrastructure.

The data is drawn from a Google Sheet which is maintained by the team ODI Leeds, but derived from
[work conducted by Gavin Freeguard](https://docs.google.com/document/d/1URoTu0S8MtyPEQlxue5ArMpi2IJOn67DdmiXwz__QQo/edit).

We've tried to provide one or more postcodes for each public sector body. The downloaded data is then stored
in the `companies.csv` file in this repo using a [Flat Data](https://octo.github.com/projects/flat-data) action.

This CSV file is post-processed to geocode the data for presentation on a map using the
[Postcodes.io](https://postcodes.io) service.
The resulting geojson file contains a top-level `FeatureCollection` with a feature per located organisation
(i.e. one entry per postcode).

Each feature has the same format

```json
{
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  properties: {
    name: name of the organisation,
    category: data stewards / data enablers / data users,
    preliminary_category: category consistent with Gavin Freeguard's work,
    admin_district: Local Administrative Units (LAUs) level 1 code,
    msoa: Middle Layer Super Output Area,
    lsoa: Lower Layer Super Output Area,
  }
}
```

* LAU1 code is as per the [Eurostat definitions](https://www.ons.gov.uk/methodology/geography/ukgeographies/eurostat).
* MSOA/LSAO are defined in the
  [ONS Census Geography](https://www.ons.gov.uk/methodology/geography/ukgeographies/censusgeography#super-output-area-soa)
