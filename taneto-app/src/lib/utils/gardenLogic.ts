import { DailyLog, GardenState } from '@/lib/types';

export const calculateGardenState = (recentLogs: DailyLog[], journalCount: number): GardenState => {
  // Default state for new users
  if (recentLogs.length === 0) {
    return {
      flowerCount: 0,
      skyBrightness: 'normal',
      hasButterfly: false
    };
  }

  // Get the most recent log (today's data)
  const latestLog = recentLogs[recentLogs.length - 1];

  // Calculate sky brightness based on sleep quality
  let skyBrightness: 'normal' | 'bright' = 'normal';
  if (latestLog.sleep === 'good') {
    skyBrightness = 'bright';
  }

  // Calculate flowers based on journal entries
  const flowerCount = Math.min(journalCount, 10); // Max 10 flowers

  // Butterflies appear when user exercised and has low stress
  const hasButterfly = latestLog.exercise === true && latestLog.stressLevel <= 2;

  return {
    flowerCount,
    skyBrightness,
    hasButterfly
  };
};

export const getGardenDescription = (state: GardenState): string => {
  const skyDescriptions = {
    bright: '明るい空が庭を照らしています',
    normal: '穏やかな空が庭を見守っています'
  };

  let description = skyDescriptions[state.skyBrightness] + '。';

  if (state.flowerCount > 0) {
    description += `${state.flowerCount}輪の花が咲いています。`;
  } else {
    description += '新しい花が咲くのを待っています。';
  }

  if (state.hasButterfly) {
    description += '蝶々が舞っています。';
  }

  return description;
};