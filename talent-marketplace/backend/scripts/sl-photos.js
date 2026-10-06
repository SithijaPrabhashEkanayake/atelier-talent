// Unsplash photo IDs of South Asian (Sri Lankan-presenting) portrait subjects,
// selected by visual review for the demo seeders. Nationality cannot be read
// from a photo, so these are "South Asian-presenting" stock images, not
// verified nationality — swap in licensed Sri Lankan photography if needed.
const FEMALE_PHOTO_IDS = [
  'photo-1536766768598-e09213fdcf22',
  'photo-1616639943825-e0fbad20a3d3',
  'photo-1626775550407-c09be28b6053',
  'photo-1626307112816-18e1c86ac131',
  'photo-1778148046667-7228d3dc59cd',
  'photo-1772037848780-f4c456155b90',
  'photo-1771654104661-ab6f3581b5af',
  'photo-1758985402638-6028bae83b98',
  'photo-1771654104010-1d50eb00a04f',
  'photo-1778148046680-cd802a2199ea',
  'photo-1778148046745-ebe12ab2c022',
  'photo-1650286549949-2cbcd1a25bad',
  'photo-1770748034186-6d6e5738cddf',
];

const MALE_PHOTO_IDS = [
  'photo-1653055645127-54ec96add7b5',
  'photo-1790575546099-13c92c38859b',
  'photo-1781106782412-d160a437d658',
  'photo-1774438023794-a0819fccca54',
  'photo-1774171312574-c468f3f5f0fa',
  'photo-1762709412743-3395ed866302',
  'photo-1762709412730-321a0d81b517',
  'photo-1618956625714-c74d457bcfdc',
  'photo-1761435756843-0ca5f4ff1d59',
  'photo-1634999752255-18e990af12f2',
];

const photoUrl = (id, width) =>
  `https://images.unsplash.com/${id}?w=${width}&q=80&auto=format&fit=crop`;

const hashToIndex = (str, mod) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
};

const pickPhoto = (isFemale, seed, width) => {
  const pool = isFemale ? FEMALE_PHOTO_IDS : MALE_PHOTO_IDS;
  return photoUrl(pool[hashToIndex(seed, pool.length)], width);
};

module.exports = { FEMALE_PHOTO_IDS, MALE_PHOTO_IDS, photoUrl, pickPhoto };
