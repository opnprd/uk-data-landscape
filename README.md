![](https://odileeds.org/resources/images/odileeds-2-black.svg)

# UK Data Landscape

This repository and resulting map is part of [ODI Leeds’ work on the UK Data Landscape](https://odileeds.org/projects/uk-data-landscape/)
which is done in collaboration with [The Open Data Institute](https://theodi.org/article/building-a-digital-picture-of-the-uks-data-landscape-data-ecosystem-project-launched/)
and [The Data City](https://thedatacity.com/).
The data used for the mapping is a [community reviewed Google Sheet][GOOGLESHEET] containing data organisations, primarily non-businesses and public organisations based on
[Gavin Freeguards’ Government Ecosystem work][FREEGUARD], and
[the Data Institutions Register developed by Jack Hardinges and Joe Massey][HARDINGES]. 

The map visualises the centralised nature of the UK data landscape as the majority of the listed organisations can be found in London.
One factor playing into this may be the predominance of government bodies and organisations working closely with these in the capital. 

While we’ve done our best to review the data mapped here, it was largely created by people in our community. This means that some information
may be missing, duplicated or even incorrect. But it also means that you can help us fill in the gaps of the UK Data Landscape on our
[Google Sheet][GOOGLESHEET]!

## Data in this repository

This repository contains two CSV files extracted from [the Google Sheet][GOOGLESHEET], as well as two GeoJSON files which
present the located organisations identified in the CSVs. The two CSVs are extracted from the Taxonomy sheet - derived from Gavin Freeguard's 
work and named `organisation-taxonomy` - and the Registers sheet - derived from the ODI Data Institutions Register and named 
`organisation-register`.

We extract the data from the Google Sheet using a [Flat Data](https://octo.github.com/projects/flat-data) action and then post-processed
to clean and geocode the organisations using the [Postcodes.io](https://postcodes.io) service. The resulting geojson file contains a top-level `FeatureCollection` with a feature per located organisation (i.e. one entry per postcode).

Each feature has the same format

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "properties": {
    "name": name of the organisation,
    "category": data stewards / data enablers / data users,
    "preliminary_category": category consistent with Gavin Freeguard's work,
    "admin_district": Local Administrative Units (LAUs) level 1 code,
    "msoa": Middle Layer Super Output Area,
    "lsoa": Lower Layer Super Output Area,
  }
}
```

* LAU1 code is as per the [Eurostat definitions](https://www.ons.gov.uk/methodology/geography/ukgeographies/eurostat).
* MSOA/LSAO are defined in the
  [ONS Census Geography](https://www.ons.gov.uk/methodology/geography/ukgeographies/censusgeography#super-output-area-soa)


[GOOGLESHEET]: https://docs.google.com/spreadsheets/d/1O-lVLR-QVykZ-cq7PlpLzjZGNpEcWaoq5b-ZnGpZWR0/edit?usp=sharing
[FREEGUARD]: https://jamboard.google.com/d/1bZdsQRslLxLTWoNKCSPk9RpRbIEZIsuvU5yaRodPYQE/viewer
[HARDINGES]: https://theodi.org/article/the-data-institutions-register/
