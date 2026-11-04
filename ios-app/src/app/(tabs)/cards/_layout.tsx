import { Stack } from 'expo-router'
import { colors, font } from '@/theme'

export default function CardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: false,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.pine,
        headerTitleStyle: { fontFamily: font.semibold, color: colors.pine },
        headerLargeTitleStyle: { fontFamily: font.semibold, color: colors.pine },
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Cards' }} />
      <Stack.Screen name="[id]" options={{ title: '', headerLargeTitle: false, headerBackButtonDisplayMode: 'minimal' }} />
    </Stack>
  )
}
