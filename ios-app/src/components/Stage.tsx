import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { FadeIn, FadeOut, ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import type { HeroCard } from '@web/components/landing/hero-cards'
import { CardArt } from './CardArt'

/** Where each rank stands, in the stage's 460×340 coordinates (the same numbers as the web hero). */
const PLACES = [
  { x: 0, y: 76, rotate: -7, scale: 1, z: 2 },
  { x: 92, y: -4, rotate: 6, scale: 0.9, z: 1 },
]
const STAGE_W = 460
const STAGE_H = 340
const spring = { damping: 22, stiffness: 180, mass: 1, reduceMotion: ReduceMotion.System }

function StageCard({ card, rank, k }: { card: HeroCard; rank: number; k: number }) {
  const place = PLACES[rank]
  // New cards arrive from up and to the right, then settle into their place.
  const x = useSharedValue(place.x + 140)
  const y = useSharedValue(place.y - 40)
  const rotate = useSharedValue(place.rotate + 14)
  const scale = useSharedValue(place.scale * 0.92)

  useEffect(() => {
    x.value = withSpring(place.x, spring)
    y.value = withSpring(place.y, spring)
    rotate.value = withSpring(place.rotate, spring)
    scale.value = withSpring(place.scale, spring)
  }, [place, x, y, rotate, scale])

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * k }, { translateY: y.value * k }, { rotate: `${rotate.value}deg` }, { scale: scale.value }],
  }))

  return (
    <Animated.View
      entering={FadeIn.duration(250).reduceMotion(ReduceMotion.System)}
      exiting={FadeOut.duration(200).reduceMotion(ReduceMotion.System)}
      style={[{ position: 'absolute', left: 0, top: 0, zIndex: place.z, shadowColor: '#16302b', shadowOpacity: 0.22, shadowRadius: 22 * k, shadowOffset: { width: 0, height: 18 * k } }, style]}
    >
      <CardArt cardId={card.id} bankName={card.bank} cardName={card.name} width={400 * k} />
    </Animated.View>
  )
}

/** The two best cards for the spend you set: the winner in front, the runner-up behind it. */
export function Stage({ cards, width }: { cards: HeroCard[]; width: number }) {
  const k = width / STAGE_W
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" style={{ width, height: STAGE_H * k }}>
      {cards.slice(0, 2).map((card, rank) => (
        <StageCard key={card.id} card={card} rank={rank} k={k} />
      ))}
    </View>
  )
}
