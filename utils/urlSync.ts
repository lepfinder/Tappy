import { ARCADE_GAMES, ArcadeDifficulty, ArcadeGameId } from '../data/arcade_games';
import { MODE_DATA_MAP } from '../constants';
import { useGameStore } from '../store/useGameStore';
import { GameMode } from '../types';
import {
  decodeCustomListPayload,
  getCustomWordListById,
  saveCustomWordList
} from './customWordLists';

const VALID_MODES = new Set<string>(Object.keys(MODE_DATA_MAP));
const VALID_ARCADE_GAMES = new Set<string>(ARCADE_GAMES.map((g) => g.id));
const VALID_DIFFS = new Set<string>(['easy', 'medium', 'hard', 'expert', 'endless']);

/** 根据当前应用状态生成规范的 URL Hash */
export function buildHashFromState(): string {
  const { view, selectedMode, currentLevel, activeArcadeGame, arcadeDifficulty } =
    useGameStore.getState();

  if (view === 'PROFILE') return '#/profile';
  if (view === 'STATS') return '#/stats';

  if (view === 'GAME' || view === 'RESULT') {
    if (activeArcadeGame) {
      return `#/arcade/${activeArcadeGame}/${arcadeDifficulty}`;
    }
    if (selectedMode && currentLevel && !currentLevel.id.startsWith('weak_drill_')) {
      return `#/play/${selectedMode}/${encodeURIComponent(currentLevel.id)}`;
    }
    if (selectedMode) {
      return `#/levels/${selectedMode}`;
    }
  }

  if (view === 'LEVELS' && selectedMode) {
    return `#/levels/${selectedMode}`;
  }

  return '#/';
}

/** 从 URL Hash 精准恢复到对应页面/关卡/小游戏 */
export function restoreStateFromHash(rawHash: string): void {
  const cleaned = rawHash.replace(/^#\/?/, '').trim();
  const store = useGameStore.getState();

  if (!cleaned) {
    if (store.view !== 'HOME') store.goHome();
    return;
  }

  const parts = cleaned.split('/').map((s) => decodeURIComponent(s));
  const [section, arg1, arg2] = parts;

  if (section === 'profile') {
    store.setView('PROFILE');
    return;
  }

  if (section === 'stats') {
    store.setView('STATS');
    return;
  }

  if (section === 'levels' && arg1 && VALID_MODES.has(arg1)) {
    store.selectMode(arg1 as GameMode);
    return;
  }

  if (section === 'import' && arg1) {
    const decoded = decodeCustomListPayload(arg1);
    if (decoded) {
      const saved = saveCustomWordList({ title: decoded.title, items: decoded.items });
      store.selectMode('EN_WORDS');
      store.refreshCustomLevels();
      // 替换掉 import hash 避免刷新重复导入，并通知 UI 展示轻提示
      window.history.replaceState(null, '', '#/levels/EN_WORDS');
      window.dispatchEvent(
        new CustomEvent('tappy:custom-list-imported', { detail: { title: saved.title, count: saved.items.length } })
      );
      return;
    }
  }

  if (section === 'play' && arg1 && arg2 && VALID_MODES.has(arg1)) {
    const mode = arg1 as GameMode;
    const levels = MODE_DATA_MAP[mode] || [];
    const exists = levels.some((l) => l.id === arg2) || Boolean(getCustomWordListById(arg2));
    if (exists) {
      store.quickStartLevel(mode, arg2);
    } else {
      store.selectMode(mode);
    }
    return;
  }

  if (section === 'arcade' && arg1 && VALID_ARCADE_GAMES.has(arg1)) {
    const gameId = arg1 as ArcadeGameId;
    const diff: ArcadeDifficulty =
      arg2 && VALID_DIFFS.has(arg2) ? (arg2 as ArcadeDifficulty) : 'easy';
    store.startArcadeGame(gameId, diff);
    return;
  }

  // 兜底未知 hash：安全回首页
  store.goHome();
}
