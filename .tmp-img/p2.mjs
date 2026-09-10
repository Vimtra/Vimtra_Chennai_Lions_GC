import sharp from 'sharp';
const SC = process.argv[2];
const f = [
  ['public/assets/photo/Cover I.JPG','cover1'],
  ['public/assets/photo/News Hero.JPG','newshero'],
  ['public/assets/photo/Al Hamra Golf Club in Ras Al Khaimah.webp','alhamra'],
];
for (const [src,name] of f) {
  const m = await sharp(src).metadata();
  console.log(name, `${m.width}x${m.height}`, m.format);
  await sharp(src).rotate().resize({width:760}).jpeg({quality:70}).toFile(`${SC}/${name}.jpg`);
}
