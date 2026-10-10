const FEMALE_MODEL_IMAGES = [
  '/images/models/talent-female-01.jpg',
  '/images/models/talent-female-02.jpg',
  '/images/models/talent-female-03.jpg',
  '/images/models/talent-female-04.jpg',
  '/images/models/talent-female-05.jpg',
  '/images/models/talent-female-06.jpg',
  '/images/models/talent-female-07.jpg',
  '/images/models/talent-female-08.jpg',
  '/images/models/talent-female-09.jpg',
];

const MALE_MODEL_IMAGES = [
  '/images/models/talent-male-01.jpg',
  '/images/models/talent-male-02.jpg',
  '/images/models/talent-male-03.jpg',
  '/images/models/talent-male-04.jpg',
  '/images/models/talent-male-05.jpg',
  '/images/models/talent-male-06.jpg',
  '/images/models/talent-male-07.jpg',
  '/images/models/talent-male-08.jpg',
  '/images/models/talent-male-09.jpg',
  '/images/models/talent-male-10.jpg',
  '/images/models/talent-male-11.jpg',
  '/images/models/talent-male-12.jpg',
];

const hashToIndex = (str, mod) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
};

const pickPhoto = (isFemale, seed) => {
  const pool = isFemale ? FEMALE_MODEL_IMAGES : MALE_MODEL_IMAGES;
  return pool[hashToIndex(seed, pool.length)];
};

module.exports = { FEMALE_MODEL_IMAGES, MALE_MODEL_IMAGES, pickPhoto };

