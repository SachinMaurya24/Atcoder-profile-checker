import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory cache for problem metadata
let problemModels = null;
let problemDetails = null;
let lastCacheFetch = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

async function ensureMetadata() {
  const now = Date.now();
  if (problemModels && problemDetails && (now - lastCacheFetch < CACHE_TTL)) {
    return;
  }
  try {
    console.log('Fetching AtCoder problem models and details from Kenkoooo...');
    const [modelsRes, problemsRes] = await Promise.all([
      fetch('https://kenkoooo.com/atcoder/resources/problem-models.json'),
      fetch('https://kenkoooo.com/atcoder/resources/problems.json')
    ]);

    if (modelsRes.ok && problemsRes.ok) {
      problemModels = await modelsRes.json();
      const problemsArray = await problemsRes.json();
      problemDetails = {};
      for (const p of problemsArray) {
        problemDetails[p.id] = p;
      }
      lastCacheFetch = now;
      console.log(`Loaded ${Object.keys(problemModels).length} models and ${problemsArray.length} problem details.`);
    }
  } catch (err) {
    console.error('Failed to prefetch problem metadata:', err);
  }
}

// Helper to determine rating tier
export function getRatingTier(rating) {
  if (rating === null || rating === undefined || rating < 0) {
    return { name: 'Unrated', color: '#94a3b8', bg: '#f1f5f9', darkBg: '#334155', rank: 'Unrated', kyu: '-' };
  }
  if (rating < 400) {
    return { name: 'Gray', color: '#808080', bg: '#f3f4f6', darkBg: '#374151', rank: 'Newbie', kyu: '8-Kyu' };
  }
  if (rating < 800) {
    return { name: 'Brown', color: '#8b5a2b', bg: '#fef3c7', darkBg: '#78350f', rank: 'Pupil', kyu: '7-Kyu' };
  }
  if (rating < 1200) {
    return { name: 'Green', color: '#22c55e', bg: '#dcfce7', darkBg: '#14532d', rank: 'Specialist', kyu: '6-Kyu' };
  }
  if (rating < 1600) {
    return { name: 'Cyan', color: '#06b6d4', bg: '#cffafe', darkBg: '#164e63', rank: 'Expert', kyu: '5-Kyu' };
  }
  if (rating < 2000) {
    return { name: 'Blue', color: '#3b82f6', bg: '#dbeafe', darkBg: '#1e3a8a', rank: 'Candidate Master', kyu: '4-Kyu' };
  }
  if (rating < 2400) {
    return { name: 'Yellow', color: '#eab308', bg: '#fef9c3', darkBg: '#713f12', rank: 'Master', kyu: '3-Kyu' };
  }
  if (rating < 2800) {
    return { name: 'Orange', color: '#f97316', bg: '#ffedd5', darkBg: '#7c2d12', rank: 'Grandmaster', kyu: '2-Kyu' };
  }
  return { name: 'Red', color: '#ef4444', bg: '#fee2e2', darkBg: '#7f1d1d', rank: 'Legendary Grandmaster', kyu: '1-Dan+' };
}

// General difficulty categories: Easy, Medium, Hard, Expert
export function getDifficultyCategory(difficulty) {
  if (difficulty === null || difficulty === undefined) return 'Unknown';
  if (difficulty < 800) return 'Easy';
  if (difficulty < 1600) return 'Medium';
  if (difficulty < 2400) return 'Hard';
  return 'Expert';
}

// Simplify language name
function cleanLanguage(lang) {
  if (!lang) return 'Other';
  const l = lang.toLowerCase();
  if (l.includes('c++')) return 'C++';
  if (l.includes('python') || l.includes('pypy')) return 'Python';
  if (l.includes('rust')) return 'Rust';
  if (l.includes('java') && !l.includes('script')) return 'Java';
  if (l.includes('go')) return 'Go';
  if (l.includes('c#')) return 'C#';
  if (l.includes('c (')) return 'C';
  if (l.includes('kotlin')) return 'Kotlin';
  if (l.includes('javascript') || l.includes('typescript') || l.includes('node')) return 'JS/TS';
  return lang.split(' ')[0] || 'Other';
}

// API endpoint to fetch full aggregated user stats
app.get('/api/user/:username/full-data', async (req, res) => {
  const { username } = req.params;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  try {
    await ensureMetadata();

    // Fetch in parallel:
    // 1. AtCoder Official History
    // 2. Kenkoooo User Info
    // 3. Kenkoooo Submissions
    const [historyRes, userInfoRes, submissionsRes] = await Promise.all([
      fetch(`https://atcoder.jp/users/${encodeURIComponent(username)}/history/json`),
      fetch(`https://kenkoooo.com/atcoder/atcoder-api/v2/user_info?user=${encodeURIComponent(username)}`),
      fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${encodeURIComponent(username)}&from_second=0`)
    ]);

    const history = historyRes.ok ? await historyRes.json() : [];
    const userInfo = userInfoRes.ok ? await userInfoRes.json() : null;
    const submissions = submissionsRes.ok ? await submissionsRes.json() : [];

    if ((!submissions || submissions.length === 0) && (!history || history.length === 0) && (!userInfo || userInfo.accepted_count === 0)) {
      return res.status(404).json({ error: `User "${username}" not found or has no activity on AtCoder.` });
    }

    // Process History & Contest Stats
    let currentRating = 0;
    let maxRating = 0;
    let abcCount = 0;
    let arcCount = 0;
    let agcCount = 0;
    let ahcCount = 0;
    let otherContestsCount = 0;
    let bestPerformance = 0;
    let worstPerformance = 999999;
    let bestRank = 999999;
    let maxRatingIncrease = 0;
    let totalPerformances = 0;
    let ratedContestCount = 0;

    const formattedHistory = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const entry of history) {
        if (!entry.IsRated) continue;

        ratedContestCount++;
        const newRate = entry.NewRating || 0;
        const oldRate = entry.OldRating || 0;
        const perf = entry.Performance || 0;
        const rank = entry.Place || 0;

        currentRating = newRate;
        if (newRate > maxRating) maxRating = newRate;
        if (perf > bestPerformance) bestPerformance = perf;
        if (perf > 0 && perf < worstPerformance) worstPerformance = perf;
        if (rank > 0 && rank < bestRank) bestRank = rank;

        const delta = newRate - oldRate;
        if (delta > maxRatingIncrease) maxRatingIncrease = delta;
        totalPerformances += perf;

        const contestName = entry.ContestName || entry.ContestScreenName || '';
        const contestScreen = (entry.ContestScreenName || '').toLowerCase();

        if (contestScreen.startsWith('abc') || contestName.includes('Beginner')) {
          abcCount++;
        } else if (contestScreen.startsWith('arc') || contestName.includes('Regular')) {
          arcCount++;
        } else if (contestScreen.startsWith('agc') || contestName.includes('Grand')) {
          agcCount++;
        } else if (contestScreen.startsWith('ahc') || contestName.includes('Heuristic')) {
          ahcCount++;
        } else {
          otherContestsCount++;
        }

        formattedHistory.push({
          contestName: entry.ContestNameEn || entry.ContestName || entry.ContestScreenName,
          contestScreenName: entry.ContestScreenName,
          date: entry.EndTime ? entry.EndTime.split('T')[0] : '',
          rawTime: entry.EndTime,
          oldRating: oldRate,
          newRating: newRate,
          delta,
          performance: perf,
          place: rank
        });
      }
    }

    if (worstPerformance === 999999) worstPerformance = 0;
    if (bestRank === 999999) bestRank = 0;

    const currentTier = getRatingTier(currentRating);
    const maxTier = getRatingTier(maxRating);

    // Process Submissions & Problem Stats
    const uniqueACProblems = new Map(); // problem_id -> earliest AC submission
    let totalSubmissions = submissions.length;
    let totalACSubmissions = 0;
    let totalWASubmissions = 0;
    let totalOtherSubmissions = 0;

    const languagesCount = {};
    const submissionsByDay = {}; // YYYY-MM-DD -> count
    const dailySubmissions = {}; // YYYY-MM-DD -> array of submissions on that day

    for (const sub of submissions) {
      // Verdict counts
      if (sub.result === 'AC') {
        totalACSubmissions++;
        if (!uniqueACProblems.has(sub.problem_id)) {
          uniqueACProblems.set(sub.problem_id, sub);
        }
      } else if (sub.result === 'WA') {
        totalWASubmissions++;
      } else {
        totalOtherSubmissions++;
      }

      // Languages
      const cleanLang = cleanLanguage(sub.language);
      languagesCount[cleanLang] = (languagesCount[cleanLang] || 0) + 1;

      // Activity calendar & daily submissions
      if (sub.epoch_second) {
        const dateStr = new Date(sub.epoch_second * 1000).toISOString().split('T')[0];
        submissionsByDay[dateStr] = (submissionsByDay[dateStr] || 0) + 1;

        if (!dailySubmissions[dateStr]) {
          dailySubmissions[dateStr] = [];
        }

        const model = problemModels ? problemModels[sub.problem_id] : null;
        const details = problemDetails ? problemDetails[sub.problem_id] : null;
        const difficulty = (model && typeof model.difficulty === 'number') ? model.difficulty : null;
        const tier = getRatingTier(difficulty);

        dailySubmissions[dateStr].push({
          id: sub.id,
          problemId: sub.problem_id,
          contestId: sub.contest_id,
          title: details ? details.title : sub.problem_id,
          result: sub.result,
          language: sub.language,
          point: sub.point,
          executionTime: sub.execution_time,
          epochSecond: sub.epoch_second,
          time: new Date(sub.epoch_second * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          difficulty,
          tierName: tier.name,
          tierColor: tier.color,
          url: `https://atcoder.jp/contests/${sub.contest_id}/tasks/${sub.problem_id}`,
          submissionUrl: `https://atcoder.jp/contests/${sub.contest_id}/submissions/${sub.id}`
        });
      }
    }

    // Difficulty breakdown of Unique AC problems
    const tierCounts = {
      Gray: 0,
      Brown: 0,
      Green: 0,
      Cyan: 0,
      Blue: 0,
      Yellow: 0,
      Orange: 0,
      Red: 0,
      Unrated: 0
    };

    const categoryCounts = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
      Expert: 0,
      Unknown: 0
    };

    const problemIndexCounts = {};
    const contestTypeCounts = {
      ABC: 0,
      ARC: 0,
      AGC: 0,
      Other: 0
    };

    const solvedProblemsList = [];

    for (const [probId, sub] of uniqueACProblems.entries()) {
      const model = problemModels ? problemModels[probId] : null;
      const details = problemDetails ? problemDetails[probId] : null;

      const difficulty = (model && typeof model.difficulty === 'number') ? model.difficulty : null;
      const tier = getRatingTier(difficulty);
      const cat = getDifficultyCategory(difficulty);

      tierCounts[tier.name] = (tierCounts[tier.name] || 0) + 1;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      // Problem Index (A, B, C, D, etc.)
      let index = 'Other';
      if (details && details.problem_index) {
        index = details.problem_index.toUpperCase();
      } else {
        const parts = probId.split('_');
        if (parts.length > 1) {
          index = parts[parts.length - 1].toUpperCase();
        }
      }
      if (index.length > 2) index = 'Other';
      problemIndexCounts[index] = (problemIndexCounts[index] || 0) + 1;

      // Contest Type
      const contestId = (sub.contest_id || (details ? details.contest_id : '') || '').toLowerCase();
      if (contestId.startsWith('abc')) {
        contestTypeCounts.ABC++;
      } else if (contestId.startsWith('arc')) {
        contestTypeCounts.ARC++;
      } else if (contestId.startsWith('agc')) {
        contestTypeCounts.AGC++;
      } else {
        contestTypeCounts.Other++;
      }

      solvedProblemsList.push({
        id: probId,
        contestId: sub.contest_id,
        title: details ? details.title : probId,
        index,
        difficulty,
        tierName: tier.name,
        tierColor: tier.color,
        category: cat,
        solvedAt: sub.epoch_second ? new Date(sub.epoch_second * 1000).toISOString() : null,
        language: sub.language,
        url: `https://atcoder.jp/contests/${sub.contest_id}/tasks/${probId}`
      });
    }

    // Sort solved problems by solve time desc
    solvedProblemsList.sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));

    // Calculate Streaks
    const sortedDates = Object.keys(submissionsByDay).sort();
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    if (sortedDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let prevDate = null;
      for (const d of sortedDates) {
        if (!prevDate) {
          tempStreak = 1;
        } else {
          const diffDays = Math.round((new Date(d) - new Date(prevDate)) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            tempStreak = 1;
          }
        }
        if (tempStreak > maxStreak) maxStreak = tempStreak;
        prevDate = d;
      }

      // Check if current streak extends to today or yesterday
      const lastDate = sortedDates[sortedDates.length - 1];
      if (lastDate === today || lastDate === yesterday) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
    }

    const payload = {
      user: {
        id: username,
        currentRating,
        maxRating,
        tier: currentTier,
        maxTier,
        acceptedCount: userInfo?.accepted_count || uniqueACProblems.size,
        acceptedRank: userInfo?.accepted_count_rank || null,
        ratedPointSum: userInfo?.rated_point_sum || null,
        ratedPointSumRank: userInfo?.rated_point_sum_rank || null,
      },
      contestStats: {
        totalContests: ratedContestCount,
        abcCount,
        arcCount,
        agcCount,
        ahcCount,
        otherContestsCount,
        bestPerformance,
        worstPerformance,
        averagePerformance: ratedContestCount > 0 ? Math.round(totalPerformances / ratedContestCount) : 0,
        bestRank,
        maxRatingIncrease,
        history: formattedHistory
      },
      problemStats: {
        totalSubmissions,
        uniqueSolvedCount: uniqueACProblems.size,
        totalACSubmissions,
        totalWASubmissions,
        totalOtherSubmissions,
        tierCounts,
        categoryCounts,
        problemIndexCounts,
        contestTypeCounts,
        languagesCount,
        recentSolved: solvedProblemsList.slice(0, 30)
      },
      streak: {
        currentStreak,
        maxStreak,
        activityByDate: submissionsByDay,
        dailySubmissions
      }
    };

    return res.json(payload);
  } catch (err) {
    console.error('Error fetching user data:', err);
    return res.status(500).json({ error: 'Failed to fetch user data: ' + err.message });
  }
});

// Configure Vite integration
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
