# Darts Game — Product Requirements Document & Implementation Plan

## 1. Product Overview

A clone of the Stake.us "Darts" instant-win game. The player places a bet, selects a difficulty, and throws a dart at a spinning dartboard. The dart lands on a colored ring segment, each mapped to a payout multiplier. Higher difficulty = fewer winning segments but dramatically higher max multipliers.

---

## 2. Game Mechanics (from screenshot analysis)

### 2.1 Dartboard Structure
- **Outer decorative ring**: Dark gray border ring (non-interactive)
- **Colored segment ring**: The main gameplay ring — divided into colored arc segments
- **Inner dark zone**: Multiple concentric dark gray/charcoal rings (visual depth)
- **Center bullseye dot**: Small green dot at the center (dart indicator / landing marker)
- The board has a 3D neumorphic appearance with subtle shadows and depth

### 2.2 Segment Colors & Multiplier Mapping (6 tiers)

| Color | Visual | Tier |
|-------|--------|------|
| Gray (dark) | Matches board background | Lowest (loss) |
| Gray (medium) | Slightly lighter | Low (loss) |
| Yellow | Bright gold/yellow | Mid-low (small win) |
| Orange | Bright orange | Mid-high |
| Red/Pink | Bright red/crimson | High |
| Green | Bright neon green | Jackpot (highest) |

### 2.3 Difficulty Levels & Multipliers

| Tier | Color Swatch | Easy | Medium | Hard | Expert |
|------|-------------|------|--------|------|--------|
| 1 | Gray | 0.5x | 0.4x | 0.2x | 0.1x |
| 2 | Gray | 0.8x | 0.6x | 0.5x | 0.5x |
| 3 | Yellow | 1.2x | 1.3x | 2.5x | 4.8x |
| 4 | Orange | 1.5x | 3.1x | 3.6x | 9.6x |
| 5 | Red | 2.7x | 6x | 8.8x | 42x |
| 6 | Green | 8.5x | 16x | 63x | 500x |

### 2.4 Segment Distribution per Difficulty (estimated from screenshots)

- **Easy**: ~14 segments total. Large yellow sections, decent orange, small red, tiny green. Most of the ring is covered.
- **Medium**: ~12 segments. More orange dominant, yellow reduced, red smaller, green tiny.
- **Hard**: ~10 segments. Orange dominant, very small yellow patches, tiny red, minuscule green.
- **Expert**: ~8 segments. Almost entirely orange, with a couple of tiny red slivers and barely-visible green/yellow.

**Key insight**: As difficulty increases, the high-multiplier segments get exponentially smaller while the low-multiplier (loss) segments grow. The gray (0.5x/0.1x) areas dominate on Expert.

### 2.5 Game Flow

1. Player sets bet amount and difficulty
2. Player clicks "Play"
3. **Result is pre-determined** (provably fair RNG)
4. Board spins/rotates animation plays
5. Dart "throws" toward the board
6. Board stops with the dart landing on the pre-determined segment
7. Payout is calculated: `bet × multiplier`
8. Result displayed (win/loss), balance updated

### 2.6 Controls

**Manual Mode:**
- Amount input field with gold "G" currency icon
- Half (½) button — halves current bet
- Double (2×) button — doubles current bet
- Difficulty dropdown: Easy | Medium | Hard | Expert
- Green "Play" button

**Auto Mode:**
- Same as Manual plus:
- Number of Games input (with ∞ infinity toggle)
- Advanced toggle (likely: stop on win, stop on loss, change bet on win/loss)
- Green "Start Autoplay" button

### 2.7 Multiplier Legend Bar
- Displayed below the dartboard
- 6 rounded-rectangle badges showing each multiplier
- Each badge has the multiplier text on top and a small colored bar on the bottom matching the ring segment color
- Updates dynamically when difficulty changes

---

## 3. Tech Stack

Matching sibling projects (SpeedCrash, Blocks, BearDice):

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animation | Framer Motion v12 + CSS keyframes |
| Dartboard rendering | **SVG** for ring segments + CSS for board structure |
| UI Components | Radix UI primitives + shadcn-style `ui/` folder |
| Icons | Lucide React |
| Audio | Howler.js |
| State | Custom React hooks (no global store) |

---

## 4. Architecture & File Structure

```
src/
├── app/
│   ├── layout.tsx                    # App shell (dark theme, fonts)
│   ├── page.tsx                      # Main page — renders <Darts />
│   └── globals.css                   # Tailwind imports, CSS vars, keyframes
├── components/
│   ├── Darts.tsx                     # Top-level orchestrator component
│   ├── darts/
│   │   ├── DartsSetupCard.tsx        # Left panel: bet, difficulty, play/auto controls
│   │   ├── DartsBoard.tsx            # SVG dartboard with rings & segments
│   │   ├── DartsMultiplierLegend.tsx # Bottom bar showing 6 multiplier badges
│   │   ├── DartProjectile.tsx        # Dart throw animation element
│   │   └── DartsResultOverlay.tsx    # Win/loss result display
│   ├── BetAmountInput.tsx            # Copied from SpeedCrash (reusable)
│   ├── GameWindow.tsx                # Game canvas wrapper with audio
│   ├── GameResultsModal.tsx          # Result modal (reusable)
│   └── ui/                           # shadcn primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── select.tsx
│       └── switch.tsx
├── hooks/
│   ├── useDartsGame.ts               # Main game state machine hook
│   ├── useAutoPlay.ts                # Auto-play loop logic
│   └── useSound.ts                   # Audio hook (Howler wrapper)
├── engine/
│   ├── DartsEngine.ts                # Core game logic: segment generation, result resolution
│   ├── DartsResolver.ts              # Provably fair RNG: determines landing segment
│   └── SegmentGenerator.ts           # Builds segment arrays per difficulty
├── config/
│   └── darts-config.ts               # All constants: multipliers, segments, colors, timing
├── types/
│   └── index.ts                      # TypeScript interfaces & types
└── public/
    ├── sounds/                        # Audio files (throw, spin, land, win, lose)
    └── (existing screenshot assets)
```

---

## 5. Core Implementation Details

### 5.1 Engine Layer (`/engine`)

**`darts-config.ts`** — Central configuration:
```ts
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'expert'] as const;

export const MULTIPLIER_TABLE = {
  easy:   [0.5, 0.8, 1.2, 1.5, 2.7, 8.5],
  medium: [0.4, 0.6, 1.3, 3.1, 6.0, 16.0],
  hard:   [0.2, 0.5, 2.5, 3.6, 8.8, 63.0],
  expert: [0.1, 0.5, 4.8, 9.6, 42.0, 500.0],
};

export const SEGMENT_COLORS = {
  tier1: '#4a5568', // dark gray
  tier2: '#718096', // medium gray
  tier3: '#EAB308', // yellow
  tier4: '#F97316', // orange
  tier5: '#EF4444', // red
  tier6: '#22C55E', // green (jackpot)
};

// Segment distribution: how many degrees each tier occupies
// Total must = 360 degrees
export const SEGMENT_DISTRIBUTION = {
  easy:   { tier1: 30, tier2: 40, tier3: 120, tier4: 90, tier5: 55, tier6: 25 },
  medium: { tier1: 50, tier2: 60, tier3: 90, tier4: 85, tier5: 50, tier6: 25 },
  hard:   { tier1: 80, tier2: 90, tier3: 70, tier4: 60, tier5: 45, tier6: 15 },
  expert: { tier1: 120, tier2: 110, tier3: 50, tier4: 40, tier5: 30, tier6: 10 },
};
```

**`SegmentGenerator.ts`** — Converts degree distributions into an array of arc segments with randomized ordering (so segments aren't grouped by color, they're interleaved like the screenshots show).

**`DartsResolver.ts`** — Pre-determines the result:
1. Takes a seed (or Math.random for now)
2. Picks a random angle (0–360)
3. Maps angle → segment → multiplier tier
4. Returns: `{ angle, tierIndex, multiplier, color }`

**`DartsEngine.ts`** — Orchestrates a round:
1. Accepts bet + difficulty
2. Calls Resolver to get result
3. Returns result object for the UI to animate toward

### 5.2 Dartboard Rendering (`DartsBoard.tsx`)

**SVG-based approach:**
- Outer container: circular div with CSS box-shadow for 3D depth/neumorphism
- Ring segments: SVG `<path>` elements using arc commands (`A`) to draw each colored segment
- Each segment is a slice of an annular ring (donut shape)
- Inner rings: concentric SVG circles with dark fills for depth effect
- Center dot: small SVG circle, bright green fill
- The entire SVG group rotates via Framer Motion's `animate({ rotate })` during spin

**Segment rendering algorithm:**
```
For each segment in segmentArray:
  1. Calculate start angle and end angle
  2. Convert to SVG arc path:
     - Outer arc at radius R_outer
     - Inner arc at radius R_inner
     - Connect with line segments
  3. Fill with segment color
  4. Apply subtle stroke for separation
```

### 5.3 Animation Sequence

1. **Pre-spin idle**: Board is static, green dot visible at center
2. **Player clicks Play**: Result pre-determined
3. **Spin animation** (~2-3 seconds):
   - Board rotates using Framer Motion `rotate` with easing
   - Starts fast, decelerates (ease-out cubic or custom spring)
   - Final rotation angle calculated so the target segment lands at the "dart position" (top-center or fixed reference point)
4. **Dart throw** (optional visual):
   - Small dart/projectile animates from edge toward center
   - Lands with a subtle "impact" effect
5. **Result reveal**:
   - Winning segment pulses/glows
   - Multiplier text appears
   - Balance updates with animated counter

### 5.4 State Machine (`useDartsGame.ts`)

States:
```
IDLE → SPINNING → RESULT → IDLE
```

Hook returns:
```ts
{
  // State
  gameState: 'idle' | 'spinning' | 'result';
  currentDifficulty: Difficulty;
  betAmount: number;
  balance: number;
  lastResult: DartsResult | null;
  sessionStats: DartsSessionStats;

  // Board data
  segments: Segment[];
  targetAngle: number;

  // Actions
  play: () => void;
  setBetAmount: (n: number) => void;
  setDifficulty: (d: Difficulty) => void;
  resetGame: () => void;
}
```

### 5.5 Auto-Play (`useAutoPlay.ts`)

- Configurable: number of rounds (or infinite)
- Advanced options (behind toggle):
  - Stop on win above X
  - Stop on loss above X
  - Increase bet on win by %
  - Increase bet on loss by %
- Runs play() in a loop with delay between rounds
- Can be stopped mid-sequence

### 5.6 Setup Card (`DartsSetupCard.tsx`)

Three-view pattern (matching sibling games):

**View 0 — Setup (idle):**
- Manual/Auto tab toggle
- BetAmountInput component
- Difficulty dropdown (Select component)
- Play / Start Autoplay button
- (Auto mode): Number of games, Advanced options

**View 1 — Playing (spinning):**
- Shows current bet and difficulty
- Disabled controls
- "Playing..." state indication

**View 2 — Result:**
- Win/Loss display with multiplier and payout
- Session stats (rounds, W/L, P&L)
- "Play Again" / "Change Settings" buttons

---

## 6. Visual Design Specifications

### 6.1 Color Palette
- **Background**: `#1a2332` (dark navy/slate)
- **Card/panel bg**: `#1e293b` with `rgba` overlays
- **Board outer ring**: `#374151` (gray-700) with inner shadow
- **Board inner zones**: Graduated dark grays (`#1f2937` → `#111827`)
- **Text**: White / `#94a3b8` (slate-400) for labels
- **Accent (Play button)**: `#22C55E` (green-500)
- **Amount label**: `#EAB308` (yellow-500 / gold)

### 6.2 Typography
- Labels: 12-14px, uppercase or sentence case, muted color
- Values: 16-18px, white, medium weight
- Multiplier badges: 14px, bold, centered

### 6.3 Responsive Layout
- **Desktop**: Left panel (~300px) + Game area (flex-1), side by side
- **Mobile**: Stacked — game area on top, controls below
- Dartboard scales responsively within its container (aspect-ratio: 1/1)

---

## 7. Implementation Phases

### Phase 1: Project Scaffold & Config
- Initialize Next.js 16 project with TypeScript, Tailwind v4
- Copy reusable components from SpeedCrash (BetAmountInput, ui/, GameWindow)
- Create `darts-config.ts` with all constants
- Create type definitions
- **Files**: `package.json`, `tsconfig.json`, `tailwind.config.*`, `app/layout.tsx`, `app/globals.css`, `config/darts-config.ts`, `types/index.ts`

### Phase 2: Engine Layer
- Implement `SegmentGenerator.ts` — builds segment arrays per difficulty
- Implement `DartsResolver.ts` — provably fair result determination
- Implement `DartsEngine.ts` — round orchestration
- Unit-testable, no UI dependencies
- **Files**: `engine/SegmentGenerator.ts`, `engine/DartsResolver.ts`, `engine/DartsEngine.ts`

### Phase 3: Dartboard Rendering
- Build `DartsBoard.tsx` — SVG ring segments + decorative rings
- Static render first (no animation)
- Test with all 4 difficulty levels to verify segment distribution looks correct
- Match the neumorphic 3D shadow styling from screenshots
- **Files**: `components/darts/DartsBoard.tsx`, `components/darts/DartsMultiplierLegend.tsx`

### Phase 4: Game State & Controls
- Implement `useDartsGame.ts` hook
- Build `DartsSetupCard.tsx` (Manual mode first)
- Wire up: bet input, difficulty selector, play button
- Build main `Darts.tsx` orchestrator
- Build `app/page.tsx` entry point
- **Files**: `hooks/useDartsGame.ts`, `components/darts/DartsSetupCard.tsx`, `components/Darts.tsx`, `app/page.tsx`

### Phase 5: Spin Animation & Result
- Add Framer Motion rotation animation to the board
- Implement easing curve (fast start → slow deceleration)
- Calculate final rotation to land on pre-determined segment
- Add result overlay / win-loss display
- Add dart throw visual (optional polish)
- **Files**: Updates to `DartsBoard.tsx`, new `DartProjectile.tsx`, `DartsResultOverlay.tsx`

### Phase 6: Auto-Play & Polish
- Implement `useAutoPlay.ts` hook
- Add auto-play UI to setup card (number of games, advanced options)
- Add sound effects (spin, throw, land, win, lose)
- Add session stats tracking
- Responsive design polish
- **Files**: `hooks/useAutoPlay.ts`, `hooks/useSound.ts`, updates to `DartsSetupCard.tsx`

---

## 8. Key Types

```ts
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
type GameState = 'idle' | 'spinning' | 'result';
type TierIndex = 0 | 1 | 2 | 3 | 4 | 5;

interface Segment {
  id: number;
  tierIndex: TierIndex;
  startAngle: number;  // degrees
  endAngle: number;    // degrees
  color: string;
  multiplier: number;
}

interface DartsResult {
  angle: number;
  segment: Segment;
  multiplier: number;
  payout: number;
  isWin: boolean;  // multiplier >= 1.0
}

interface DartsSessionStats {
  totalRounds: number;
  wins: number;
  losses: number;
  netPnL: number;
  biggestWin: number;
}

interface AutoPlayConfig {
  numberOfGames: number;  // 0 = infinite
  stopOnWinAbove: number | null;
  stopOnLossAbove: number | null;
  increaseBetOnWin: number;  // percentage
  increaseBetOnLoss: number; // percentage
}
```

---

## 9. Verification & Testing

1. **Visual verification**: Compare rendered dartboard at each difficulty against reference screenshots side-by-side
2. **Segment math**: Verify all segment degrees sum to exactly 360 for each difficulty
3. **Multiplier accuracy**: Verify the multiplier legend shows correct values per difficulty
4. **RNG distribution**: Run 10,000 simulated rounds per difficulty, verify payout distribution matches expected house edge
5. **Animation**: Verify spin always lands on the pre-determined segment angle
6. **Auto-play**: Test infinite mode, stop conditions, bet adjustments
7. **Responsive**: Test at 375px (mobile), 768px (tablet), 1280px (desktop)
8. **Dev server**: `npm run dev` → navigate to localhost:3000 → play full rounds on all 4 difficulties
