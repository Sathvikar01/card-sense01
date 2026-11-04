import { LinearGradient } from 'expo-linear-gradient'
import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { getCardDesign, type CardDesign } from '@web/data/card-designs'

/** The card's own aspect ratio (ISO/IEC 7810 ID-1). */
export const CARD_RATIO = 1.586

type Gradient = { colors: [string, string, ...string[]]; locations: [number, number, ...number[]]; start: { x: number; y: number }; end: { x: number; y: number } }

/** Turns the web's `linear-gradient(135deg, #a 0%, #b 100%)` into expo-linear-gradient props. */
function parseGradient(css: string): Gradient {
  const angle = Number(/(-?\d+(?:\.\d+)?)deg/.exec(css)?.[1] ?? 135)
  const stops = [...css.matchAll(/(#[0-9a-f]{3,8}|rgba?\([^)]*\))\s+(\d+(?:\.\d+)?)%/gi)].map((m) => ({ color: m[1], at: Number(m[2]) / 100 }))
  const safe = stops.length >= 2 ? stops : [{ color: '#3b5998', at: 0 }, { color: '#2d4373', at: 1 }]
  // CSS angles point "to"; 0deg is up, 90deg is right.
  const rad = (angle * Math.PI) / 180
  const dx = Math.sin(rad) / 2
  const dy = -Math.cos(rad) / 2
  return {
    colors: safe.map((s) => s.color) as Gradient['colors'],
    locations: safe.map((s) => s.at) as Gradient['locations'],
    start: { x: 0.5 - dx, y: 0.5 - dy },
    end: { x: 0.5 + dx, y: 0.5 + dy },
  }
}

function Network({ network, color, scale }: { network: CardDesign['network']; color: string; scale: number }) {
  if (network === 'mastercard') {
    const d = 22 * scale
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: '#eb001b' }} />
        <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: '#f79e1b', marginLeft: -d * 0.4, opacity: 0.92 }} />
      </View>
    )
  }
  if (network === 'amex') {
    return (
      <Text style={{ color, fontSize: 11 * scale, fontWeight: '800', letterSpacing: 1.5 * scale, borderWidth: 1.5 * scale, borderColor: color, paddingHorizontal: 5 * scale, paddingVertical: 2 * scale }}>
        AMEX
      </Text>
    )
  }
  const label = network === 'rupay' ? 'RuPay' : network === 'diners' ? 'Diners Club' : 'VISA'
  return (
    <Text style={{ color, fontSize: (network === 'visa' ? 26 : 15) * scale, fontWeight: '900', fontStyle: network === 'visa' ? 'italic' : 'normal', letterSpacing: network === 'visa' ? -0.5 * scale : 0 }}>
      {label}
    </Text>
  )
}

type Props = { cardId: string; bankName?: string; cardName?: string; width: number }

/**
 * The same card art as the website, drawn natively at any width. Every measure is
 * defined at 400px (the web's "lg" card) and scaled, so proportions match exactly.
 */
export const CardArt = memo(function CardArt({ cardId, bankName, cardName, width }: Props) {
  const design = getCardDesign(cardId, bankName, cardName)
  const gradient = parseGradient(design.gradient)
  const s = width / 400
  const ink = design.textColor === 'white' ? '#ffffff' : '#1a1a1a'
  const subtle = design.textColor === 'white' ? 'rgba(255,255,255,0.55)' : 'rgba(26,26,26,0.55)'
  const chip = design.chipStyle === 'gold' ? ['#c9a84c', '#f2d06b', '#b8923a'] as const : ['#a8adb3', '#e8eaec', '#9aa0a6'] as const
  const small = width < 160

  return (
    <LinearGradient {...gradient} style={{ width, height: width / CARD_RATIO, borderRadius: 14 * s, overflow: 'hidden', paddingHorizontal: 28 * s, paddingVertical: 20 * s, justifyContent: 'space-between' }}>
      <View style={styles.row}>
        <Text style={{ color: ink, fontSize: 10 * s, fontWeight: '700', letterSpacing: 1.8 * s, opacity: 0.95 }}>{design.bankLabel}</Text>
        <Network network={design.network} color={ink} scale={s} />
      </View>
      {!small && <LinearGradient colors={chip} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44 * s, height: 32 * s, borderRadius: 6 * s }} />}
      {!small && <Text style={{ color: subtle, fontSize: 12 * s, letterSpacing: 2.4 * s }}>****   ****   ****   ****</Text>}
      <View style={[styles.row, { alignItems: 'flex-end' }]}>
        <Text numberOfLines={1} style={{ color: ink, fontSize: 14 * s, fontWeight: '700', letterSpacing: 1.4 * s, flexShrink: 1 }}>
          {(cardName || design.cardLabel).toUpperCase()}
        </Text>
        {!small && <Text style={{ color: subtle, fontSize: 8 * s, letterSpacing: 0.8 * s }}>12/29</Text>}
      </View>
    </LinearGradient>
  )
})

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
})
