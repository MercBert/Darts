# Darts — Task Breakdown

## Phase 1: Project Scaffold & Config ✅
- [x] Init Next.js project with TypeScript, Tailwind v4
- [x] Copy reusable components (BetAmountInput, GameWindow, GameResultsModal, ui/)
- [x] Install dependencies
- [x] Create `lib/games.ts` with dartsGame config
- [x] Create `lib/utils.ts`
- [x] Create `app/layout.tsx`, `app/globals.css`

## Phase 2: Engine Layer
- [ ] Create `types/index.ts` — all TypeScript interfaces
- [ ] Create `config/darts-config.ts` — multipliers, segment distributions (2% house edge), colors, timing
- [ ] Implement `engine/SegmentGenerator.ts` — builds segment arrays per difficulty with randomized interleaving
- [ ] Implement `engine/DartsResolver.ts` — pre-determines result (random angle → segment → multiplier)
- [ ] Implement `engine/DartsEngine.ts` — orchestrates a round (bet + difficulty → result)

## Phase 3: Dartboard Rendering
- [ ] Build `components/darts/DartsBoard.tsx` — SVG ring segments + decorative rings + static board
- [ ] Build `components/darts/DartsMultiplierLegend.tsx` — 6 multiplier badges below board
- [ ] Build `components/darts/DartMarker.tsx` — SVG shuriken/cross dart markers with glow effect
- [ ] Persistent darts: show previous throw positions on the board
- [ ] Test with all 4 difficulty levels visually

## Phase 4: Game State & Controls
- [ ] Implement `hooks/useDartsGame.ts` — main game state machine hook
- [ ] Build `components/darts/DartsSetupCard.tsx` — 3-view setup card (Ape Church pattern)
  - View 0: BetAmountInput at top → Difficulty selector → Play button at bottom
  - View 1: Playing state (disabled controls)
  - View 2: Game over (result + stats + Play Again/Change Bet)
- [ ] Build `components/Darts.tsx` — orchestrator (GameWindow + SetupCard wired together)
- [ ] Build `app/page.tsx` — entry point
- [ ] Build `components/darts/DartsResultHistory.tsx` — vertical strip inside GameWindow showing recent results

## Phase 5: Dart Throw Animation & Result
- [ ] Dart throw animation (dart flies from edge to landing position)
- [ ] Landing impact effect (glow pulse on contact)
- [ ] Winning segment highlight
- [ ] Result reveal with multiplier text
- [ ] Balance update animation

## Phase 6: Auto-Play & Polish
- [ ] Implement `hooks/useAutoPlay.ts`
- [ ] Add auto-play UI to DartsSetupCard (number of games, advanced options)
- [ ] Sound effects (throw, land, win, lose)
- [ ] Session stats tracking
- [ ] Responsive design polish (mobile stacked, desktop side-by-side)

## Notes
- Static board (no spin) — dart lands on pre-determined segment
- Darts persist on board between rounds (shuriken/cross shape, most recent has glow)
- Results history sidebar inside GameWindow (right edge)
- 2% house edge across all difficulties
- Dummy data for now — Mark's team handles blockchain integration
- Port: 3104
