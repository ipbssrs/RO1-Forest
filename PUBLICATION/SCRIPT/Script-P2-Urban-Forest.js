// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
var bogor = ee.FeatureCollection(
    'users/rahmatasyari/urban');

Map.addLayer(urban, {}, 'urban');

/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud masked Sentinel-2 image
 */
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
var sentinel_2 = ee.ImageCollection('COPERNICUS/S2')
                  .filterDate('2021-01-01', '2021-7-30')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
                  .filterBounds(urban)
                  .map(maskS2clouds)
                  .median()

var rgbVis = {
  min: 0.004,
  max: 0.39,
  bands: ['B11', 'B8', 'B4'],
};

//NDVI
var ndvi = sentinel_2.expression('(NIR - Red) / (NIR + Red)', {
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4')
});

//NDWI
var ndwi = sentinel_2.expression('(Green - NIR) / (Green + NIR)', {
  'NIR': sentinel_2.select('B8'),
  'Green': sentinel_2.select('B3')
});

//SAVI
var savi = sentinel_2.expression('((NIR - Red) / (NIR + Red +0.5)) * (1.0+0.5)', {
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4')
});

//Enhanced Vegetation Index (EVI)
var evi = sentinel_2.expression('((NIR - Red) / ((NIR + 6) * (Red - 7.5) * (Blue + 1))) * 2.5', {
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4'),
  'Blue': sentinel_2.select('B2')
});

//Index-Based Built-Up Area Index (IBI)
var ibi = sentinel_2.expression('(((SWIR / (SWIR * NIR)) * 2) - ((NIR / (NIR + Red)) + (Green/(Green + SWIR)))) / (((SWIR / (SWIR * NIR)) * 2) + ((NIR / (NIR + Red)) + (Green/(Green + SWIR))))', {
  'SWIR': sentinel_2.select('B11'),
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4'),
  'Green': sentinel_2.select('B3')
});

//Atmospherically Resistant Vegetation Index (ARVI)
var arvi = sentinel_2.expression('(NIR - (Red - (1 * (Red - Blue)))) / (NIR + (Red - (1 * (Red - Blue))))', {
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4'),
  'Blue': sentinel_2.select('B2')
});

//Specific Leaf Area Vegetation Index (SLAVI)
var slavi = sentinel_2.expression('(NIR) / (Red + SWIR)', {
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4'),
  'SWIR': sentinel_2.select('B12')
});

//Green normalized difference vegetation index (GNDVI)
var gndvi = sentinel_2.expression('(NIR - Green) / (NIR + Green)', {
  'Green': sentinel_2.select('B3'),
  'NIR': sentinel_2.select('B8')
});

//Ratio vegetation index (RVI)
var rvi = sentinel_2.expression('(NIR / Red)', {
  'Red': sentinel_2.select('B4'),
  'NIR': sentinel_2.select('B8')
});

//Difference vegetation index (DVI)
var dvi = sentinel_2.expression('NIRn / Red', {
  'Red': sentinel_2.select('B5'),
  'NIRn': sentinel_2.select('B9')
});

//Land Surface Water Index (LSWI)
var lswi = sentinel_2.expression('(NIR - SWIR) / (NIR + SWIR)', {
  'SWIR': sentinel_2.select('B12'),
  'NIR': sentinel_2.select('B8')
});

//Modified Normalized Difference Water Index (MNDWI)
var mndwi = sentinel_2.expression('(Green - SWIR) / (Green + SWIR)', {
  'SWIR': sentinel_2.select('B12'),
  'Green': sentinel_2.select('B3')
});

//Inverted Red-Edge Chlorophyll Index (IRECI)
var ireci = sentinel_2.expression('(NIR - Red) / (R1 + R2)', {
  'NIR': sentinel_2.select('B7'),
  'Red': sentinel_2.select('B4'),
  'R1': sentinel_2.select('B5'),
  'R2': sentinel_2.select('B6')
});

//Inverted Red-Edge Chlorophyll Index (IRECI)
var ireci = sentinel_2.expression('(NIR - Red) / (R1 + R2)', {
  'NIR': sentinel_2.select('B7'),
  'Red': sentinel_2.select('B4'),
  'R1': sentinel_2.select('B5'),
  'R2': sentinel_2.select('B6')
});

//Advanced Vegetation Index (AVI)
var avi = sentinel_2.expression('(1 - Red) / (NIR - Red)', {
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4'),
});

//Bare Soil Index (BSI)
var bsi = sentinel_2.expression('((SWIR + Red) - (NIR + Blue)) / ((SWIR + Red) + (NIR + Blue))', {
  'SWIR': sentinel_2.select('B11'),
  'NIR': sentinel_2.select('B8'),
  'Blue': sentinel_2.select('B2'),
  'Red': sentinel_2.select('B4'),
});

//Soil and Atmospherically Resistant Vegetation Index (SARVI)
var sarvi = sentinel_2.expression('((NIR - (Red - (Blue - Red))) * 1.5) / (NIR + (Red - (Blue - Red)))', {
  'NIR': sentinel_2.select('B8'),
  'Blue': sentinel_2.select('B2'),
  'Red': sentinel_2.select('B4'),
});

//Visible Atmospherically Resistant Index (VARI)
var vari = sentinel_2.expression('(Green - Red) / (Green + Red - Blue)', {
  'Green': sentinel_2.select('B3'),
  'Blue': sentinel_2.select('B2'),
  'Red': sentinel_2.select('B4'),
});

//Normalized Difference Vegetation Index  (NDBI)
var ndbi = sentinel_2.expression('(SWIR - NIR) / (SWIR + NIR)', {
  'NIR': sentinel_2.select('B8'),
  'SWIR': sentinel_2.select('B11'),
});

var final_image = sentinel_2.addBands(ndvi.rename('NDVI'))
                            .addBands(ndwi.rename('NDWI'))
                            .addBands(savi.rename('SAVI'))
                            .addBands(evi.rename('EVI'))
                            .addBands(ibi.rename('IBI'))
                            .addBands(arvi.rename('ARVI'))
                            .addBands(slavi.rename('SLAVI'))
                            .addBands(gndvi.rename('GNDVI'))
                            .addBands(rvi.rename('RVI'))
                            .addBands(dvi.rename('DVI'))
                            .addBands(lswi.rename('LSWI'))
                            .addBands(mndwi.rename('MNDWI'))
                            .addBands(ireci.rename('IRECI'))
                            .addBands(avi.rename('AVI'))
                            .addBands(bsi.rename('BSI'))
                            .addBands(sarvi.rename('SARVI'))
                            .addBands(vari.rename('VARI'))
                            .addBands(ndbi.rename('NDBI'));

var bands = ['NDVI', 'NDWI', 'SAVI', 'EVI', 'IBI', 'ARVI', 'SLAVI', 'GNDVI', 'RVI', 'DVI', 'LSWI', 'MNDWI', 'IRECI', 'AVI', 'BSI', 'SARVI', 'VARI', 'NDBI'];

print(final_image);
Map.addLayer(final_image.clip(urban), rgbVis, 'Image');

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
var KJ_air = ee.FeatureCollection(
    'users/rahmatasyari/Research_ICTS/0_LU_air_Sentinel');
var KJ_htn = ee.FeatureCollection(
    'users/rahmatasyari/Research_ICTS/1_LU_Hutan_2_sentinel');
var KJ_pmk = ee.FeatureCollection(
    'users/rahmatasyari/Research_ICTS/2_LU_pmk_Sentinel');
var KJ_tnh = ee.FeatureCollection(
    'users/rahmatasyari/Research_ICTS/3_LU_tnh_sentinel');
var KJ_tani = ee.FeatureCollection(
    'users/rahmatasyari/Research_ICTS/4_LU_tani_sentinel');

var trainingPoly =KJ_air.merge(KJ_htn).merge(KJ_pmk).merge(KJ_tnh).merge(KJ_tani);
print(trainingPoly, 'trainingPoly')

var training = final_image.select(bands).sampleRegions({
  collection: trainingPoly,
  properties: ['Landuse','ID'],
  scale: 10
});

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
var classifier = ee.Classifier.smileRandomForest(10).train({
  features: training,
  classProperty: 'ID',
  inputProperties: bands
});
var classified = final_image.select(bands).classify(classifier);

var palette = [
  '0a01ff', // KJ_air (0)  // biru
  '006a4e', // KJ_htn (1)// hijau
  'ff1493',// KJ_pmk (2) //pink
  'b0d12a',// KJ_tnh (3) // toska
  'ffff00',// KJ_tani (4) // Kuning 
];
Map.addLayer(classified.clip(urban), {min: 0, max: 3, palette: palette}, 'Land Use Classification');

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
Export.image.toDrive({
  image: savi.clip(urban),
  region: urban,
  description: 'UF_S2_SAVI_2021_F',
  folder: 'GEE',
  scale: 10,
  maxPixels: 10E11,
  fileFormat: 'GeoTIFF',
});
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
