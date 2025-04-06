import React, { useState } from 'react'

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [sortOption, setSortOption] = useState(
    localStorage.getItem('reddit-comment-companion-sortOption') || 'top'
  )
  const [maxLevel, setMaxLevel] = useState(
    parseInt(localStorage.getItem('reddit-comment-companion-maxLevel') || '1')
  )
  const [containerWidth, setContainerWidth] = useState(
    parseInt(localStorage.getItem('reddit-comment-companion-containerWidth') || '20')
  )

  const handleSave = () => {
    localStorage.setItem('reddit-comment-companion-sortOption', sortOption)
    localStorage.setItem('reddit-comment-companion-maxLevel', maxLevel.toString())
    localStorage.setItem('reddit-comment-companion-containerWidth', containerWidth.toString())
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
          min={1}
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