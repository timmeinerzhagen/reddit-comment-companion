import { create } from 'zustand'
import type { SortOption } from '../types/reddit'

interface Settings {
  sortOption: SortOption
  maxLevel: number
  containerWidth: number
  setSettings: (settings: Partial<Settings>) => void
}

export const useSettings = create<Settings>((set) => ({
  sortOption: (localStorage.getItem('reddit-comment-companion-sortOption') as SortOption) || 'top',
  maxLevel: Number(localStorage.getItem('reddit-comment-companion-maxLevel')) || 1,
  containerWidth: Number(localStorage.getItem('reddit-comment-companion-containerWidth')) || 20,
  setSettings: (newSettings) => {
    set((state) => {
      const settings = { ...state, ...newSettings }
      localStorage.setItem('reddit-comment-companion-sortOption', settings.sortOption)
      localStorage.setItem('reddit-comment-companion-maxLevel', String(settings.maxLevel))
      localStorage.setItem('reddit-comment-companion-containerWidth', String(settings.containerWidth))
      return settings
    })
  }
}))