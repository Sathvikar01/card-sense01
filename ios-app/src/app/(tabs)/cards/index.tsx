import { Stack, router, useFocusEffect } from 'expo-router'
import { setStatusBarStyle } from 'expo-status-bar'
import { useCallback, useMemo, useState } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { CardArt } from '@/components/CardArt'
import { Empty, Failed, Loading } from '@/components/States'
import { feeLabel, useCards, type CardSummary } from '@/lib/cards'
import { hasWebsite } from '@/lib/env'
import { EDGE, colors, font } from '@/theme'

function Row({ card }: { card: CardSummary }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${card.card_name}, ${card.bank_name}, ${feeLabel(card.annual_fee)}`}
      onPress={() => router.push({ pathname: '/cards/[id]', params: { id: card.id } })}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.tint }]}
    >
      <CardArt cardId={card.card_slug} bankName={card.bank_name} cardName={card.card_name} width={84} />
      <View style={styles.text}>
        <Text numberOfLines={1} style={styles.name}>{card.card_name}</Text>
        <Text numberOfLines={1} style={styles.meta}>{card.bank_name}</Text>
      </View>
      <Text style={styles.fee}>{card.annual_fee > 0 ? `₹${card.annual_fee.toLocaleString('en-IN')}` : 'Free'}</Text>
    </Pressable>
  )
}

/** The catalog, most popular first, with the native search field in the large-title header. */
export default function Cards() {
  const [result, reload, refresh] = useCards()
  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }, [refresh])
  const [query, setQuery] = useState('')

  useFocusEffect(useCallback(() => setStatusBarStyle('dark'), []))

  const shown = useMemo(() => {
    if (result.state !== 'ready') return []
    const q = query.trim().toLowerCase()
    return q ? result.data.filter((c) => `${c.card_name} ${c.bank_name}`.toLowerCase().includes(q)) : result.data
  }, [result, query])

  return (
    <>
      <Stack.Screen options={{ headerSearchBarOptions: { placeholder: 'Search cards or banks', onChangeText: (e) => setQuery(e.nativeEvent.text), tintColor: colors.pine } }} />
      {!hasWebsite ? (
        <Empty title="Cards appear here once this build is connected to CardSense." />
      ) : result.state === 'loading' ? (
        <Loading />
      ) : result.state === 'error' ? (
        <Failed what="cards" onRetry={reload} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <Row card={item} />}
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="on-drag"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pine} />}
          ListEmptyComponent={<Empty title={query ? `No cards match “${query.trim()}”.` : 'No cards yet.'} />}
          contentContainerStyle={styles.list}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: EDGE, paddingVertical: 10, minHeight: 72 },
  text: { flex: 1, gap: 2 },
  name: { fontFamily: font.medium, fontSize: 17, color: colors.pine },
  meta: { fontFamily: font.regular, fontSize: 15, color: colors.muted },
  fee: { fontFamily: font.regular, fontSize: 15, color: colors.muted, fontVariant: ['tabular-nums'] },
})
