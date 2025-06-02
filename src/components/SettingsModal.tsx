import React from 'react'

interface SettingsModalProps {
  onClose: () => void
  maxLevel: number
  setMaxLevel: React.Dispatch<React.SetStateAction<number>>
  sortOption: string
  setSortOption: React.Dispatch<React.SetStateAction<string>>
  containerWidth: number
  setContainerWidth: React.Dispatch<React.SetStateAction<number>>
  fontSize: number
  setFontSize: React.Dispatch<React.SetStateAction<number>>
  theme: string
  setTheme: React.Dispatch<React.SetStateAction<string>>
}

export default function SettingsModal({ 
  onClose, 
  maxLevel, 
  setMaxLevel, 
  sortOption, 
  setSortOption, 
  containerWidth, 
  setContainerWidth,
  fontSize,
  setFontSize,
  theme,
  setTheme
}: SettingsModalProps) {

  const handleSave = () => {
    localStorage.setItem('reddit-comment-companion-sortOption', sortOption)
    localStorage.setItem('reddit-comment-companion-maxLevel', maxLevel.toString())
    localStorage.setItem('reddit-comment-companion-containerWidth', containerWidth.toString())
    localStorage.setItem('reddit-comment-companion-fontSize', fontSize.toString())
    localStorage.setItem('reddit-comment-companion-theme', theme)
    onClose()
  }

  return (
    <div className="rcc-settings-modal">
      <label>
        Sort Comments By:
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="rcc-settings-input"
        >
          <option value="top">Top</option>
          <option value="confidence">Best</option>
          <option value="new">New</option>
          <option value="controversial">Controversial</option>
          <option value="old">Old</option>
          <option value="qa">Q&A</option>
        </select>
      </label>

      <label>
        Max Reply Level:
        <input
          type="number"
          value={maxLevel}
          onChange={(e) => setMaxLevel(parseInt(e.target.value))}
          min={0}
          className="rcc-settings-input"
        />
      </label>

      <label>
        Container Width (% of screen):
        <input
          type="number"
          value={containerWidth}
          onChange={(e) => setContainerWidth(parseInt(e.target.value))}
          className="rcc-settings-input"
        />
      </label>

      <label>
        Font Size (px):
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          min={7}
          className="rcc-settings-input"
        />
      </label>

      <label>
        Theme:
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="rcc-settings-input"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>

      <button
        onClick={handleSave}
        className="rcc-settings-button"
      >
        Save
      </button>
    </div>
  )
}