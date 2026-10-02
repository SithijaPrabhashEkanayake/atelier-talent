import { create } from 'zustand';
import soundFX from '../utils/soundEffects';

export const useCompareStore = create((set, get) => ({
  selectedTalents: [],
  isComparing: false,
  isBudgetModalOpen: false,
  isCommandPaletteOpen: false,

  addTalent: (talent) => {
    const { selectedTalents } = get();
    const id = talent.id || talent._id;
    if (selectedTalents.some((t) => (t.id || t._id) === id)) {
      // Toggle off if already selected
      get().removeTalent(id);
      return;
    }
    if (selectedTalents.length >= 3) {
      soundFX.playTick();
      return; // Max 3 talents can be compared side-by-side
    }
    soundFX.playChime();
    set({ selectedTalents: [...selectedTalents, talent] });
  },

  removeTalent: (talentId) => {
    soundFX.playTick();
    set((state) => ({
      selectedTalents: state.selectedTalents.filter((t) => (t.id || t._id) !== talentId),
      isComparing: state.selectedTalents.length <= 1 ? false : state.isComparing,
    }));
  },

  clearTalents: () => {
    soundFX.playTick();
    set({ selectedTalents: [], isComparing: false });
  },

  openCompare: () => {
    soundFX.playWhoosh();
    set({ isComparing: true });
  },

  closeCompare: () => {
    set({ isComparing: false });
  },

  openBudgetModal: () => {
    soundFX.playWhoosh();
    set({ isBudgetModalOpen: true });
  },

  closeBudgetModal: () => {
    set({ isBudgetModalOpen: false });
  },

  openCommandPalette: () => {
    soundFX.playWhoosh();
    set({ isCommandPaletteOpen: true });
  },

  closeCommandPalette: () => {
    set({ isCommandPaletteOpen: false });
  },

  toggleCommandPalette: () => {
    const next = !get().isCommandPaletteOpen;
    if (next) soundFX.playWhoosh();
    set({ isCommandPaletteOpen: next });
  },
}));

export default useCompareStore;
