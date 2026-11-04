import { HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold, useFonts } from '@expo-google-fonts/hanken-grotesk'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { colors } from '@/theme'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({ HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold })

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync()
  }, [loaded, error])

  // Fall back to the system font rather than holding the splash screen if a font fails.
  if (!loaded && !error) return null

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}
