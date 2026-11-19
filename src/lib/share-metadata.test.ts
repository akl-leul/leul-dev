import { describe, expect, test } from 'bun:test';
import { getShareMetadata } from './share-metadata';
import { countAtProgress } from './count-up';

describe('shared page identity', () => {
  test('homepage points to leul.tech', () => {
    expect(getShareMetadata('/').url).toBe('https://leul.tech/');
  });
  test('the requested project has its own URL, title and image', () => {
    const metadata = getShareMetadata('/projects/62324141-cdaa-4772-bade-748f20757737', { title: 'A real project', description: 'Project details', image: 'https://leul.tech/project-cover.jpg' });
    expect(metadata.url).toBe('https://leul.tech/projects/62324141-cdaa-4772-bade-748f20757737');
    expect(metadata.title).toBe('A real project');
    expect(metadata.image).toBe('https://leul.tech/project-cover.jpg');
    expect(metadata.image).not.toBe(getShareMetadata('/').image);
  });
});

describe('totals count from zero to the actual number', () => {
  test('25 projects start at 0 and end at 25', () => {
    expect(countAtProgress(25, 0)).toBe(0);
    expect(countAtProgress(25, 0.3)).toBeGreaterThan(0);
    expect(countAtProgress(25, 0.3)).toBeLessThan(25);
    expect(countAtProgress(25, 1)).toBe(25);
  });
});