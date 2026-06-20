import { ref } from 'vue'

const isMuted = ref(false)
let bgAudio: HTMLAudioElement | null = null
let hoverAudio: HTMLAudioElement | null = null
let clickAudio: HTMLAudioElement | null = null
const isPlaying = ref(false)

const playBg = () => {
  if (!bgAudio || isMuted.value || isPlaying.value) return
  bgAudio.play()
    .then(() => {
      isPlaying.value = true
    })
    .catch((err) => {
      console.warn('Autoplay blocked background audio:', err)
      isPlaying.value = false
    })
}

const pauseBg = () => {
  if (!bgAudio) return
  bgAudio.pause()
  isPlaying.value = false
}

// Global user interaction listener to start audio if blocked by autoplay policy
const handleUserInteraction = () => {
  if (bgAudio && !isPlaying.value && !isMuted.value) {
    playBg()
  }
  if (isPlaying.value || isMuted.value) {
    removeInteractionListeners()
  }
}

const addInteractionListeners = () => {
  if (typeof window === 'undefined') return
  window.addEventListener('click', handleUserInteraction, { once: true })
  window.addEventListener('keydown', handleUserInteraction, { once: true })
  window.addEventListener('pointerdown', handleUserInteraction, { once: true })
}

const removeInteractionListeners = () => {
  if (typeof window === 'undefined') return
  window.removeEventListener('click', handleUserInteraction)
  window.removeEventListener('keydown', handleUserInteraction)
  window.removeEventListener('pointerdown', handleUserInteraction)
}

export const useAudio = () => {
  const initAudio = () => {
    if (!process.client) return

    // Retrieve saved preference from localStorage
    const savedMuted = localStorage.getItem('audio-muted')
    isMuted.value = savedMuted === 'true'

    // Initialize background audio element
    if (!bgAudio) {
      bgAudio = new Audio('/audio/bg-sound.m4a')
      bgAudio.loop = true
      bgAudio.volume = 0.075 // Pleasant, low background volume
    }

    // Initialize hover sound effect
    if (!hoverAudio) {
      hoverAudio = new Audio('/audio/hover.wav')
      hoverAudio.volume = 0.15
    }

    // Initialize click sound effect
    if (!clickAudio) {
      clickAudio = new Audio('/audio/click.wav')
      clickAudio.volume = 0.25
    }

    // Try autoplay
    if (!isMuted.value) {
      bgAudio.play()
        .then(() => {
          isPlaying.value = true
        })
        .catch(() => {
          // Blocked by browser policies, listen for first user action
          addInteractionListeners()
        })
    }
  }

  const toggleMute = () => {
    if (!process.client) return
    isMuted.value = !isMuted.value
    localStorage.setItem('audio-muted', String(isMuted.value))

    if (isMuted.value) {
      pauseBg()
      removeInteractionListeners()
    } else {
      if (bgAudio) {
        playBg()
        if (!isPlaying.value) {
          addInteractionListeners()
        }
      }
    }
  }

  const playHover = () => {
    if (!process.client || isMuted.value || !hoverAudio) return
    hoverAudio.currentTime = 0
    hoverAudio.play().catch(() => {})
  }

  const playClick = () => {
    if (!process.client || isMuted.value || !clickAudio) return
    clickAudio.currentTime = 0
    clickAudio.play().catch(() => {})
  }

  return {
    isMuted,
    isPlaying,
    initAudio,
    toggleMute,
    playHover,
    playClick,
  }
}
