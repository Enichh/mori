import { describe, it, expect } from 'vitest';

describe('Anime Watch Integration', () => {
  it('ConsumetPlayer should be importable', async () => {
    const mod = await import('@/components/player/consumet-player');
    expect(mod.ConsumetPlayer).toBeDefined();
  });

  it('ConsumetService should be importable', async () => {
    const mod = await import('@/services/consumet');
    expect(mod.ConsumetService).toBeDefined();
  });

  it('AnilistService should expose anime service', async () => {
    const mod = await import('@/services/anilist');
    const instance = mod.AnilistService.getInstance();
    expect(instance.anime).toBeDefined();
    expect(typeof instance.anime.search).toBe('function');
    expect(typeof instance.anime.getDetails).toBe('function');
  });
});
