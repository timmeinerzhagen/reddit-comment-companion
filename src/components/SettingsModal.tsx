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
  windowMode: string
  setWindowMode: React.Dispatch<React.SetStateAction<string>>
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
  windowMode,
  setWindowMode
}: SettingsModalProps) {

  const handleSave = () => {
    localStorage.setItem('reddit-comment-companion-sortOption', sortOption)
    localStorage.setItem('reddit-comment-companion-maxLevel', maxLevel.toString())
    localStorage.setItem('reddit-comment-companion-containerWidth', containerWidth.toString())
    localStorage.setItem('reddit-comment-companion-fontSize', fontSize.toString())
    localStorage.setItem('reddit-comment-companion-windowMode', windowMode)
    onClose()
  }

  return (
    <div className="rcc-settings-modal">
      <div className="rcc-settings-form">
        <label className="rcc-form-label">Window Mode:</label>
        <select
          className="rcc-form-input"
          value={windowMode}
          onChange={(e) => setWindowMode(e.target.value)}
        >
          <option value="docked">Docked</option>
          <option value="floating">Floating</option>
        </select>

        <label className="rcc-form-label">Sort Comments By:</label>
        <select
          className="rcc-form-input"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="top">Top</option>
          <option value="confidence">Best</option>
          <option value="new">New</option>
          <option value="controversial">Controversial</option>
          <option value="old">Old</option>
          <option value="qa">Q&A</option>
        </select>

        <label className="rcc-form-label">Max Reply Level:</label>
        <input
          className="rcc-form-input"
          type="number"
          value={maxLevel}
          onChange={(e) => setMaxLevel(parseInt(e.target.value))}
          min={0}
        />

        {windowMode === 'docked' && (
          <>
            <label className="rcc-form-label">Container Width (% of screen):</label>
            <input
              className="rcc-form-input"
              type="number"
              value={containerWidth}
              onChange={(e) => setContainerWidth(parseInt(e.target.value))}
            />
          </>
        )}

        <label className="rcc-form-label">Font Size (px):</label>
        <input
          className="rcc-form-input"
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          min={7}
        />
      </div>

      <button
        className="rcc-settings-button"
        onClick={handleSave}
      >
        Save
      </button>
    </div>
  )
}