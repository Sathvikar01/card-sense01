import * as Haptics from 'expo-haptics'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, font } from '@/theme'

/** A single-choice set of pills: the web's ToggleGroup "chip" variant. The chosen one is the gold fill. */
export function Chips<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void; label: string }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.row}>
      {options.map((o) => {
        const on = o.value === value
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => {
              if (on) return
              if (Platform.OS === 'ios') Haptics.selectionAsync()
              onChange(o.value)
            }}
            hitSlop={4}
            style={({ pressed }) => [styles.chip, { backgroundColor: on ? colors.gold : pressed ? colors.tintStrong : colors.tint }]}
          >
            <Text style={[styles.text, { color: colors.pine }]}>{o.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 40, borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  text: { fontFamily: font.medium, fontSize: 15 },
})
