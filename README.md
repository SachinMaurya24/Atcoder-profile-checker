# AtCoder Visualizer & Problem Tracker Dashboard

A modern, high-performance web dashboard for AtCoder modeled after the best analytics features of Codeforces. It gives you deep analytics for any AtCoder user handle, solving the problem of AtCoder not displaying total solved counts and breakdowns directly.

---

## YOU all can use this website !! PLZZ 
https://atcoder-profile-checker.vercel.app/

## 🌟 Key Features

1. **User Identity & Color Badges**:
   - AtCoder Official Kyu/Dan ranks (8-Kyu to 1-Dan+)
   - Codeforces-style rank titles (Newbie, Pupil, Specialist, Expert, Master, Grandmaster, Legendary Grandmaster)
   - Current Rating & Max Rating with official color badges
   - Total Problems Solved counter & Global Accepted Rank
   - Rated Point Sum & Global Rank

2. **Contest Participation Breakdown**:
   - **ABC Given**: Total AtCoder Beginner Contests participated
   - **ARC Given**: Total AtCoder Regular Contests participated
   - **AGC Given**: Total AtCoder Grand Contests participated
   - **AHC & Other**: Heuristic & Open contests participated
   - Best Performance, Average Performance, Best Global Rank, and Highest Single-Contest Rating Jump (+delta)

3. **Codeforces-Style Rating History Graph**:
   - Interactive rating curve with colored points for each contest
   - Official AtCoder tier background zones (Gray, Brown, Green, Cyan, Blue, Yellow, Orange, Red)
   - Toggleable **Performance curve** to compare performance vs rating
   - Rich tooltips with Contest Name, Date, Rank, Performance, Old/New Rating, and Delta

4. **Problem Difficulty Distribution**:
   - **Difficulty Categories**: Easy (<800), Medium (800-1599), Hard (1600-2399), and Expert/Master (2400+) with percentage progress bars
   - **Color Tier Bar Chart**: Solved count by exact difficulty rating tier (Kenkoooo difficulty model)

5. **Problem Index & Contest Source Breakdown**:
   - Solved tasks by problem index: **A, B, C, D, E, F, G, Ex**
   - Doughnut chart of contest sources: ABC solved vs ARC solved vs AGC solved vs Other
   - Accurate AC Rate and Verdict distribution (AC, WA, Total Submissions)

6. **Consistency & Activity Heatmap**:
   - Current consecutive day streak & Longest streak
   - 16-week GitHub/Codeforces-style activity heatmap
   - Top programming languages distribution (C++, Python, Rust, Java, etc.)

7. **Recently Solved Problems Explorer**:
   - Searchable and filterable table of latest accepted submissions
   - Difficulty rating badges, task links, contest names, languages, and solve timestamps

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start the Application
You can run it in development mode (with hot-reload):
```bash
npm run dev
```
Or run the production server:
```bash
npm start
```

Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Usage & Setting Your Default ID

You can customize the default AtCoder ID in three easy ways:

1. **Directly in the UI (Recommended)**:
   - Search for your AtCoder ID in the search bar.
   - Click the **"⭐ Set as Default"** button on the profile banner.
   - Your handle will be saved in your browser's local storage and will automatically load whenever you open the dashboard!

2. **In Code (`src/config.js`)**:
   - Open [`src/config.js`](file:///Users/sachinmaurya/Desktop/Projects/Atcoder%20work/src/config.js) and update `DEFAULT_HANDLE` with your ID:
     ```javascript
     export const DEFAULT_HANDLE = 'your_atcoder_id';
     ```

3. **Via URL Query Parameter**:
   - Access directly with `?user=your_id` or `?handle=your_id`, e.g.:
     ```
     http://localhost:3000/?user=your_atcoder_id
     ```

---

## 🛠️ Tech Stack & Data Sources

- **Frontend**: React 19, Tailwind CSS v4, Chart.js, Lucide Icons, Vite
- **Backend**: Node.js Express server with caching and proxy to avoid CORS
- **APIs**:
  - Official AtCoder Rating History: `https://atcoder.jp/users/{user}/history/json`
  - Kenkoooo AtCoder Problems API: `user_info`, `submissions`, `problem-models.json`, `problems.json`
