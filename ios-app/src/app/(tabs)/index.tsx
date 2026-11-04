import { useFocusEffect } from 'expo-router'
import { setStatusBarStyle } from 'expo-status-bar'
import { useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { rankCards, type SpendCategory } from '@web/components/landing/hero-cards'
import { Button } from '@/components/Button'
import { CardArt } from '@/components/CardArt'
import { openWeb } from '@/lib/web'
import { EDGE, colors, font } from '@/theme'

/** The same four spenders as the website's examples; the card for each comes from the shared rankCards. */
const PEOPLE: { who: string; category: SpendCategory; monthly: number }[] = [
  { who: 'Orders food most nights', category: 'dining', monthly: 12000 },
  { who: 'Shops online every week', category: 'online', monthly: 20000 },
  { who: 'Runs the family groceries', category: 'groceries', monthly: 15000 },
  { who: 'Drives to work', category: 'fuel', monthly: 8000 },
]

/** The website's landing page, native: the promise, four examples, one action. No inputs, no prices. */
export default function Home() {
  const { width } = useWindowDimensions()
  const cardWidth = Math.min(width - EDGE * 2, 420)
  useFocusEffect(useCallback(() => setStatusBarStyle('dark'), []))

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <Text accessibilityRole="header" style={styles.headline}>
        Find the card that{' '}<Text style={styles.highlight}>pays you back.</Text>
      </Text>
      <Button onPress={() => openWeb('/advisor')}>Find my card</Button>

      {PEOPLE.map((person) => {
        const [best] = rankCards(person.category, person.monthly)
        return (
          <View key={person.category} style={styles.example}>
            <View accessible accessibilityRole="image" accessibilityLabel={`${best.card.bank} ${best.card.name}`} style={styles.art}>
              <CardArt cardId={best.card.id} bankName={best.card.bank} cardName={best.card.name} width={cardWidth} />
            </View>
            <View>
              <Text style={styles.who}>{person.who}</Text>
              <Text style={styles.muted}>
                {best.card.bank} {best.card.name}
              </Text>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: EDGE, paddingTop: 24, paddingBottom: 48, gap: 28 },
  headline: { fontFamily: font.semibold, fontSize: 46, lineHeight: 50, letterSpacing: -2, color: colors.pine },
  // The promise sits on gold, as on the website: gold is a fill under pine text, never text itself.
  highlight: { backgroundColor: colors.gold },
  example: { gap: 16, marginTop: 20 },
  art: { alignSelf: 'flex-start', shadowColor: colors.pine, shadowOpacity: 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 10 } },
  who: { fontFamily: font.medium, fontSize: 18, lineHeight: 24, color: colors.pine },
  muted: { fontFamily: font.regular, fontSize: 16, lineHeight: 22, color: colors.muted },
})
