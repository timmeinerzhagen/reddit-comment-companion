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
  setFontSize
}: SettingsModalProps) {

  const handleSave = () => {
    localStorage.setItem('reddit-comment-companion-sortOption', sortOption)
    localStorage.setItem('reddit-comment-companion-maxLevel', maxLevel.toString())
    localStorage.setItem('reddit-comment-companion-containerWidth', containerWidth.toString())
    localStorage.setItem('reddit-comment-companion-fontSize', fontSize.toString())
    onClose()
  }

  return (
    <div className="rcc-settings-modal">
      <label>
        Sort Comments By:
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{
            marginLeft: '10px',
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #343536',
            backgroundColor: '#2A2A2B',
            color: '#D7DADC'
          }}
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
          style={{
            marginLeft: '10px',
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #343536',
            backgroundColor: '#2A2A2B',
            color: '#D7DADC'
          }}
        />
      </label>

      <label>
        Container Width (% of screen):
        <input
          type="number"
          value={containerWidth}
          onChange={(e) => setContainerWidth(parseInt(e.target.value))}
          style={{
            marginLeft: '10px',
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #343536',
            backgroundColor: '#2A2A2B',
            color: '#D7DADC'
          }}
        />
      </label>

      <label>
        Font Size (px):
        <input
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          min={7}
          style={{
            marginLeft: '10px',
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #343536',
            backgroundColor: '#2A2A2B',
            color: '#D7DADC'
          }}
        />
      </label>

      <button
        onClick={handleSave}
        style={{
          marginTop: '10px',
          backgroundColor: '#0079D3',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '4px',
          padding: '5px 10px',
          cursor: 'pointer'
        }}
      >
        Save
      </button>
    </div>
  )
}