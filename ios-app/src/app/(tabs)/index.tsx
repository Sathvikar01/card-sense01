import Slider from '@react-native-community/slider'
import { useFocusEffect } from 'expo-router'
import { setStatusBarStyle } from 'expo-status-bar'
import { useCallback, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { SPEND_CATEGORIES, rankCards, type SpendCategory } from '@web/components/landing/hero-cards'
import { Button } from '@/components/Button'
import { Chips } from '@/components/Chips'
import { Stage } from '@/components/Stage'
import { openWeb } from '@/lib/web'
import { EDGE, colors, font } from '@/theme'

const inr = (value: number) => `₹${Math.max(0, value).toLocaleString('en-IN')}`

/**
 * The website's hero, native: pick your biggest spend and the card that pays you most
 * comes to the front. Same rates and ranking as the web (shared from hero-cards.ts).
 */
export default function Home() {
  const { width } = useWindowDimensions()
  const [category, setCategory] = useState<SpendCategory>('online')
  const [monthly, setMonthly] = useState(25000)
  const ranked = useMemo(() => rankCards(category, monthly), [category, monthly])
  const [best, second] = ranked

  useFocusEffect(useCallback(() => setStatusBarStyle('light'), []))

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <Text accessibilityRole="header" style={styles.headline}>
        Pay yourself back.
      </Text>

      <View style={styles.stage}>
        <Stage cards={ranked.map((r) => r.card)} width={Math.min(width - EDGE * 2, 520)} />
      </View>

      <Text style={styles.lead}>Pick your biggest spend. The card that pays you most comes to the front.</Text>

      <Chips label="Your biggest spend" options={SPEND_CATEGORIES} value={category} onChange={setCategory} />

      <View style={styles.amount}>
        <View style={styles.between}>
          <Text style={styles.body}>Each month</Text>
          <Text style={[styles.body, styles.strong]}>{inr(monthly)}</Text>
        </View>
        <Slider
          accessibilityLabel="Each month"
          accessibilityValue={{ text: `${inr(monthly)} a month` }}
          minimumValue={2000}
          maximumValue={100000}
          step={1000}
          value={monthly}
          onValueChange={setMonthly}
          minimumTrackTintColor={colors.gold}
          maximumTrackTintColor={colors.fieldTintStrong}
          thumbTintColor={colors.paper}
          style={styles.slider}
        />
      </View>

      <View accessibilityLiveRegion="polite" style={[styles.between, styles.result]}>
        <View style={styles.shrink}>
          <Text style={styles.figure}>{inr(best.yearly)}</Text>
          <Text style={styles.body}>
            a year with {best.card.bank} {best.card.name}
          </Text>
        </View>
        <View style={styles.next}>
          <Text style={styles.small}>{inr(second.yearly)}</Text>
          <Text style={styles.small}>{second.card.name}</Text>
        </View>
      </View>

      <Button variant="accent" onPress={() => openWeb('/advisor')}>
        Find my card
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.pine },
  content: { paddingHorizontal: EDGE, paddingTop: 24, paddingBottom: 40, gap: 24 },
  headline: { fontFamily: font.semibold, fontSize: 56, lineHeight: 54, letterSpacing: -2.6, color: colors.paper },
  stage: { alignItems: 'center', marginVertical: 8 },
  lead: { fontFamily: font.regular, fontSize: 18, lineHeight: 26, color: colors.paper },
  amount: { gap: 4 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 },
  body: { fontFamily: font.regular, fontSize: 17, lineHeight: 24, color: colors.paper },
  strong: { fontFamily: font.semibold, fontVariant: ['tabular-nums'] },
  slider: { height: 44 },
  result: { alignItems: 'flex-end' },
  shrink: { flexShrink: 1 },
  figure: { fontFamily: font.semibold, fontSize: 48, lineHeight: 52, letterSpacing: -1, color: colors.gold, fontVariant: ['tabular-nums'] },
  next: { alignItems: 'flex-end', paddingBottom: 2 },
  small: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: colors.paper, fontVariant: ['tabular-nums'] },
})
