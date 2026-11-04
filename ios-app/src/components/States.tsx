import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { colors, font } from '@/theme'
import { Button } from './Button'

/** Loading, error and empty, the three states every data region has besides "ready". */
export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.pine} />
    </View>
  )
}

export function Failed({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Unable to load {what}. Check your connection and try again.</Text>
      <Button variant="quiet" onPress={onRetry}>
        Try again
      </Button>
    </View>
  )
}

export function Empty({ title }: { title: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, minHeight: 240 },
  title: { fontFamily: font.regular, fontSize: 17, lineHeight: 24, color: colors.pine, textAlign: 'center' },
})
