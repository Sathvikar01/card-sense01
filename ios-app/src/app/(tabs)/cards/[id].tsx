import { Stack, useLocalSearchParams } from 'expo-router'
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { Button } from '@/components/Button'
import { CARD_RATIO, CardArt } from '@/components/CardArt'
import { Failed, Loading } from '@/components/States'
import { feeLabel, inr, useCard } from '@/lib/cards'
import { openUrl } from '@/lib/web'
import { EDGE, colors, font } from '@/theme'

const sentence = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  )
}

/** One card: the art, the fees, what it is best for, and a way to apply at the bank. */
export default function CardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [result, reload] = useCard(id)
  const { width } = useWindowDimensions()

  if (result.state === 'loading') return <Loading />
  if (result.state === 'error') return <Failed what="this card" onRetry={reload} />
  const card = result.data
  const applyUrl = card.apply_url
  const artWidth = Math.min(width - EDGE * 2, 420)

  return (
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: card.card_name }} />
      <View style={[styles.art, { width: artWidth, height: artWidth / CARD_RATIO, borderRadius: (14 * artWidth) / 400 }]}>
        <CardArt cardId={card.card_slug} bankName={card.bank_name} cardName={card.card_name} width={artWidth} />
      </View>

      <View style={styles.heading}>
        <Text accessibilityRole="header" style={styles.title}>{card.card_name}</Text>
        <Text style={styles.bank}>{card.bank_name}</Text>
      </View>

      <View style={styles.facts}>
        <Fact label="Annual fee" value={feeLabel(card.annual_fee)} />
        <Fact label="Joining fee" value={card.joining_fee > 0 ? inr(card.joining_fee) : 'None'} />
        {card.annual_fee_waiver_spend ? <Fact label="Fee waived after" value={`${inr(card.annual_fee_waiver_spend)} spent`} /> : null}
        {card.lounge_access && card.lounge_access !== 'none' ? <Fact label="Lounges" value={sentence(card.lounge_access)} /> : null}
        {card.best_for?.length ? <Fact label="Best for" value={sentence(card.best_for.join(', '))} /> : null}
      </View>

      {card.description ? <Text style={styles.body}>{card.description}</Text> : null}

      {card.pros?.length ? (
        <View style={styles.pros}>
          {card.pros.slice(0, 5).map((p) => (
            <Text key={p} style={styles.body}>
              {p}
            </Text>
          ))}
        </View>
      ) : null}

      {applyUrl ? (
        <Button block onPress={() => openUrl(applyUrl)}>
          Apply at {card.bank_name}
        </Button>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: EDGE, paddingTop: 8, paddingBottom: 40, gap: 28 },
  art: { alignSelf: 'center', shadowColor: colors.pine, shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 12 } },
  heading: { gap: 4 },
  title: { fontFamily: font.semibold, fontSize: 30, lineHeight: 34, letterSpacing: -0.6, color: colors.pine },
  bank: { fontFamily: font.regular, fontSize: 17, color: colors.muted },
  facts: { gap: 16 },
  fact: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  factLabel: { fontFamily: font.regular, fontSize: 17, color: colors.muted },
  factValue: { fontFamily: font.medium, fontSize: 17, color: colors.pine, flexShrink: 1, textAlign: 'right' },
  pros: { gap: 12 },
  body: { fontFamily: font.regular, fontSize: 17, lineHeight: 25, color: colors.pine },
})
