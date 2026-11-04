import * as Haptics from 'expo-haptics'
import type { ReactNode } from 'react'
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native'
import { colors, font } from '@/theme'

type Variant = 'primary' | 'accent' | 'quiet'

const look: Record<Variant, { bg: string; pressed: string; ink: string }> = {
  primary: { bg: colors.pine, pressed: '#0f231f', ink: colors.paper },
  accent: { bg: colors.gold, pressed: '#c99a2e', ink: colors.pine },
  quiet: { bg: colors.tint, pressed: colors.tintStrong, ink: colors.pine },
}

/** A 50pt pill: the web's Button, at iOS touch size. Presses scale to 0.97 with a light tap. */
export function Button({ children, onPress, variant = 'primary', loading = false, block = false }: { children: ReactNode; onPress: () => void; variant?: Variant; loading?: boolean; block?: boolean }) {
  const v = look[variant]
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading }}
      disabled={loading}
      onPress={() => {
        if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
      style={({ pressed }) => [styles.base, block && styles.block, { backgroundColor: pressed ? v.pressed : v.bg, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
    >
      {loading ? <ActivityIndicator color={v.ink} /> : <Text style={[styles.label, { color: v.ink }]}>{children}</Text>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { minHeight: 50, borderRadius: 25, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  block: { alignSelf: 'stretch' },
  label: { fontFamily: font.medium, fontSize: 17 },
})
