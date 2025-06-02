// Utility for handling extension storage operations
// Replaces localStorage with chrome.storage for better extension practices

export interface SettingsData {
  sortOption: string
  maxLevel: number
  containerWidth: number
  fontSize: number
}

const DEFAULT_SETTINGS: SettingsData = {
  sortOption: "top",
  maxLevel: 1,
  containerWidth: 25,
  fontSize: 14
}

const STORAGE_KEYS = {
  sortOption: "reddit-comment-companion-sortOption",
  maxLevel: "reddit-comment-companion-maxLevel",
  containerWidth: "reddit-comment-companion-containerWidth",
  fontSize: "reddit-comment-companion-fontSize"
} as const

// Save settings to extension storage
export async function saveSettings(settings: SettingsData): Promise<void> {
  const storageData = {
    [STORAGE_KEYS.sortOption]: settings.sortOption,
    [STORAGE_KEYS.maxLevel]: settings.maxLevel.toString(),
    [STORAGE_KEYS.containerWidth]: settings.containerWidth.toString(),
    [STORAGE_KEYS.fontSize]: settings.fontSize.toString()
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.set(storageData, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

// Load settings from extension storage
export async function loadSettings(): Promise<SettingsData> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(Object.values(STORAGE_KEYS), (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        const settings: SettingsData = {
          sortOption:
            result[STORAGE_KEYS.sortOption] || DEFAULT_SETTINGS.sortOption,
          maxLevel: parseInt(
            result[STORAGE_KEYS.maxLevel] ||
              DEFAULT_SETTINGS.maxLevel.toString()
          ),
          containerWidth: parseInt(
            result[STORAGE_KEYS.containerWidth] ||
              DEFAULT_SETTINGS.containerWidth.toString()
          ),
          fontSize: parseInt(
            result[STORAGE_KEYS.fontSize] ||
              DEFAULT_SETTINGS.fontSize.toString()
          )
        }
        resolve(settings)
      }
    })
  })
}

// Load a single setting from extension storage
export async function loadSetting<K extends keyof SettingsData>(
  key: K
): Promise<SettingsData[K]> {
  const storageKey = STORAGE_KEYS[key]
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([storageKey], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        const value = result[storageKey]
        if (value === undefined) {
          resolve(DEFAULT_SETTINGS[key])
        } else {
          // Handle string to number conversion for numeric settings
          if (
            key === "maxLevel" ||
            key === "containerWidth" ||
            key === "fontSize"
          ) {
            resolve(parseInt(value) as SettingsData[K])
          } else {
            resolve(value as SettingsData[K])
          }
        }
      }
    })
  })
}
