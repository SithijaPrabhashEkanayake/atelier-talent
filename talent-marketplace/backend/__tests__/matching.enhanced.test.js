const matchingEngine = require('../services/matchingEngine');

describe('Explainable Matching Engine Unit Tests (DSRM Algorithmic Evaluation)', () => {
  const sampleCasting = {
    category: 'runway',
    country: 'France',
    criteria: {
      minAge: 20,
      maxAge: 28,
      minHeightCm: 175,
      maxHeightCm: 185,
      requiredSkills: ['catwalk', 'posing'],
    },
  };

  it('generates 100% score and Exceptional tier for an ideal candidate', () => {
    const idealModel = {
      category: 'runway',
      country: 'France',
      dateOfBirth: new Date(new Date().getFullYear() - 24, 0, 1), // 24 years old
      heightCm: 180,
      skills: ['catwalk', 'posing', 'editorial'],
    };

    const result = matchingEngine.computeMatchScore(sampleCasting, idealModel);

    expect(result.score).toBe(100);
    expect(result.matchTier).toBe('Exceptional');
    expect(result.breakdown.age.matched).toBe(true);
    expect(result.breakdown.height.matched).toBe(true);
    expect(result.breakdown.category.matched).toBe(true);
    expect(result.breakdown.country.matched).toBe(true);
    expect(result.breakdown.skills.matched).toBe(true);
    expect(result.keyStrengths.length).toBeGreaterThanOrEqual(4);
    expect(result.keyGaps.length).toBe(0);
    expect(typeof result.explanation).toBe('string');
    expect(result.explanation).toContain('Exceptional match');
  });

  it('penalizes unmatched dimensions and generates explainable gap insights', () => {
    const divergentModel = {
      category: 'commercial',
      country: 'USA',
      dateOfBirth: new Date(new Date().getFullYear() - 45, 0, 1), // 45 years old
      heightCm: 160,
      skills: ['acting'],
    };

    const result = matchingEngine.computeMatchScore(sampleCasting, divergentModel);

    expect(result.score).toBeLessThan(30);
    expect(result.matchTier).toBe('Poor');
    expect(result.breakdown.age.matched).toBe(false);
    expect(result.breakdown.height.matched).toBe(false);
    expect(result.breakdown.category.matched).toBe(false);
    expect(result.breakdown.country.matched).toBe(false);
    expect(result.breakdown.skills.matched).toBe(false);
    expect(result.keyGaps.length).toBeGreaterThanOrEqual(4);
  });

  it('evaluates cross-disciplinary category transfer affinity when enabled', () => {
    const editorialModel = {
      category: 'editorial', // Related to runway with 0.6 affinity
      country: 'France',
      dateOfBirth: new Date(new Date().getFullYear() - 24, 0, 1),
      heightCm: 180,
      skills: ['catwalk', 'posing'],
    };

    // Standard matching (no affinity)
    const standardResult = matchingEngine.computeMatchScore(sampleCasting, editorialModel, {
      enableAffinity: false,
    });
    // Enhanced matching with category affinity transfer
    const affinityResult = matchingEngine.computeMatchScore(sampleCasting, editorialModel, {
      enableAffinity: true,
    });

    expect(affinityResult.score).toBeGreaterThan(standardResult.score);
    expect(affinityResult.breakdown.category.affinityScore).toBe(0.6);
  });

  it('handles partial skill overlap proportionally', () => {
    const partialModel = {
      category: 'runway',
      country: 'France',
      dateOfBirth: new Date(new Date().getFullYear() - 24, 0, 1),
      heightCm: 180,
      skills: ['catwalk'], // 1 of 2 skills
    };

    const result = matchingEngine.computeMatchScore(sampleCasting, partialModel);

    expect(result.breakdown.skills.overlapFraction).toBe(0.5);
    expect(result.breakdown.skills.matchedSkills).toEqual(['catwalk']);
    expect(result.score).toBe(90); // 100 - (20 * 0.5) = 90
    expect(result.matchTier).toBe('Exceptional');
  });
});
