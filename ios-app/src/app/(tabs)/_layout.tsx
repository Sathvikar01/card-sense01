import { NativeTabs } from 'expo-router/native-tabs'
import { colors } from '@/theme'

/** Three destinations, in the system tab bar with SF Symbols (Apple HIG). */
export default function TabsLayout() {
  return (
    <NativeTabs tintColor={colors.pine}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cards">
        <NativeTabs.Trigger.Label>Cards</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'creditcard', selected: 'creditcard.fill' }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
