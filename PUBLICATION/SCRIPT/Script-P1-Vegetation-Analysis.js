//SCRIPT analisis P1, RO1 Forest Research Group

var bogor = ee.FeatureCollection(
    'users/rahmatasyari/bgr');

Map.addLayer(bogor, {}, 'bogor');

function maskS2clouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

var sentinel_2 = ee.ImageCollection('COPERNICUS/S2')
                  .filterDate('2019-01-30', '2020-12-30')
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 5))
                  .filterBounds(bogor)
                  .map(maskS2clouds)
                  .median()

var rgbVis = {
  min: 0.004,
  max: 0.39,
  bands: ['B11', 'B8', 'B4'],
};


var ndvi = sentinel_2.expression('(NIR - Red) / (NIR + Red)', {
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4')
});

var ndwi = sentinel_2.expression('(Green - NIR) / (Green + NIR)', {
  'NIR': sentinel_2.select('B8'),
  'Green': sentinel_2.select('B3')
});

var savi = sentinel_2.expression('((NIR - Red) / (NIR + Red +0.5)) * (1.0+0.5)', {
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4')
});

var evi = sentinel_2.expression('((NIR - Red) / ((NIR + 6) * (Red - 7.5) * (Blue + 1))) * 2.5', {
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4'),
  'Blue': sentinel_2.select('B2')
});

var ibi = sentinel_2.expression('(((SWIR / (SWIR * NIR)) * 2) - ((NIR / (NIR + Red)) + (Green/(Green + SWIR)))) / (((SWIR / (SWIR * NIR)) * 2) + ((NIR / (NIR + Red)) + (Green/(Green + SWIR))))', {
  'SWIR': sentinel_2.select('B11'),
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4'),
  'Green': sentinel_2.select('B3')
});

var arvi = sentinel_2.expression('(NIR - (Red - (1 * (Red - Blue)))) / (NIR + (Red - (1 * (Red - Blue))))', {
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4'),
  'Blue': sentinel_2.select('B2')
});

var slavi = sentinel_2.expression('(NIR) / (Red + SWIR)', {
  'NIR': sentinel_2.select('B8'),
  'Red': sentinel_2.select('B4'),
  'SWIR': sentinel_2.select('B12')
});

var gndvi = sentinel_2.expression('(NIR - Green) / (NIR + Green)', {
  'Green': sentinel_2.select('B3'),
  'NIR': sentinel_2.select('B8')
});

var final_image = sentinel_2.addBands(ndvi.rename('NDVI'))
                            .addBands(ndwi.rename('NDWI'))
                            .addBands(savi.rename('SAVI'))
                            .addBands(evi.rename('EVI'))
                            .addBands(ibi.rename('IBI'))
                            .addBands(arvi.rename('ARVI'))
                            .addBands(slavi.rename('SLAVI'))
                            .addBands(gndvi.rename('GNDVI'));

var bands = ['B2', 'B3', 'B4', 'B5', 'B8', 'B9', 'NDVI', 'NDWI', 'SAVI', 'EVI', 'IBI', 'ARVI', 'SLAVI', 'GNDVI'];

print(final_image);
Map.addLayer(final_image.clip(bogor), rgbVis, 'Image');

var LU_Air = ee.FeatureCollection(
    'users/rahmatasyari/0_LU_Air');
var LU_Hutan = ee.FeatureCollection(
    'users/rahmatasyari/1_LU_Hutan');
var LU_Pemukiman = ee.FeatureCollection(
    'users/rahmatasyari/2_LU_Rumah');
var LU_Perkebunan = ee.FeatureCollection(
    'users/rahmatasyari/3_LU_Kebun');
var LU_Pertanian = ee.FeatureCollection(
    'users/rahmatasyari/4_LU_Pertanian');
var LU_Tanah = ee.FeatureCollection(
    'users/rahmatasyari/5_LU_Tanah');


var trainingPoly =LU_Air.merge(LU_Hutan).merge(LU_Pemukiman).merge(LU_Perkebunan).merge(LU_Pertanian).merge(LU_Tanah);
print(trainingPoly, 'trainingPoly')

var training = final_image.select(bands).sampleRegions({
  collection: trainingPoly,
  properties: ['Landuse','ID'],
  scale: 10
});

var classifier = ee.Classifier.smileRandomForest(10).train({
  features: training,
  classProperty: 'ID',
  inputProperties: bands
});

var classified = final_image.select(bands).classify(classifier);

var palette = [
  '0a01ff', // LU_Air (0)  // biru
  '006a4e', // LU_Hutan (1)// hijau
  'ff1493',// LU_Pemukiman (2) //pink
  'b0d12a',// LU_Perkebunan (3) // toska
  'ffff00',// LU_Pertanian (4) // Kuning 
  'dc143c'// LU_Tanah (4) // merah
];

Map.addLayer(classified.clip(bogor), {min: 0, max: 3, palette: palette}, 'Land Use Classification');

Export.image.toDrive({
  image: classified.clip(bogor),
  region: bogor,
  description: 'LU_BGRKAB',
  folder: 'GEE',
  scale: 10,
  maxPixels: 10E11,
  fileFormat: 'GeoTIFF',
});
