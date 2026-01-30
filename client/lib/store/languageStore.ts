
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Language, dictionaries } from '../dictionaries'

interface LanguageState {
    language: Language
    setLanguage: (lang: Language) => void
    t: typeof dictionaries.en
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'zh', // Default to Chinese as requested by user context recently
            setLanguage: (lang) => set({ language: lang }),
            get t() {
                // This is a bit of a hack to get the dictionary based on current state directly in the hook if needed, 
                // but typically we verify access via state.language.
                // However, zustand persist stores state. 
                // Let's rely on a helper or just derive it in the component.
                return dictionaries['zh']
            }
        }),
        {
            name: 'language-storage',
            partialize: (state) => ({ language: state.language }), // Only persist language string
        }
    )
)

// Helper hook to get current dictionary
export const useTranslation = () => {
    const language = useLanguageStore((state) => state.language)
    const setLanguage = useLanguageStore((state) => state.setLanguage)
    return {
        t: dictionaries[language],
        language,
        setLanguage
    }
}
