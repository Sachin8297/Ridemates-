/**
 * Simple ride matching utility.
 * Computes a compatibility score between a search query and a ride.
 * Returns a score 0-100 and a label.
 */

/**
 * Normalise a location string for fuzzy comparison.
 */
const normalise = (str) =>
  str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

/**
 * Check if two location strings are loosely compatible.
 * Returns true if they share at least one significant word.
 */
const locationsMatch = (a, b) => {
  if (!a || !b) return false;
  const wordsA = new Set(normalise(a).split(/\s+/).filter((w) => w.length > 2));
  const wordsB = normalise(b).split(/\s+/).filter((w) => w.length > 2);
  return wordsB.some((w) => wordsA.has(w));
};

/**
 * Calculate absolute difference in minutes between two HH:MM strings.
 */
const timeDiffMinutes = (t1, t2) => {
  if (!t1 || !t2) return Infinity;
  const [h1, m1] = t1.split(':').map(Number);
  const [h2, m2] = t2.split(':').map(Number);
  return Math.abs(h1 * 60 + m1 - (h2 * 60 + m2));
};

/**
 * Compute match score and label.
 * @param {Object} ride - Mongoose Ride document (populated driver)
 * @param {Object} query - { origin, destination, departureTime, date }
 * @returns {{ score: number, label: string }}
 */
const computeMatchScore = (ride, query) => {
  let score = 0;

  // Origin match  (40 pts)
  if (query.origin && locationsMatch(ride.origin, query.origin)) score += 40;

  // Destination match (40 pts)
  if (query.destination && locationsMatch(ride.destination, query.destination)) score += 40;

  // Time proximity (20 pts)
  if (query.departureTime) {
    const diff = timeDiffMinutes(ride.departureTime, query.departureTime);
    if (diff <= 15) score += 20;
    else if (diff <= 30) score += 15;
    else if (diff <= 60) score += 8;
  }

  let label = 'Low match';
  if (score >= 80) label = 'Great match';
  else if (score >= 50) label = 'Good match';
  else if (score >= 30) label = 'Partial match';

  return { score, label };
};

module.exports = { computeMatchScore, locationsMatch };
