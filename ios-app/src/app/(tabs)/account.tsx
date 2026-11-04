import type { Session } from '@supabase/supabase-js'
import { useFocusEffect } from 'expo-router'
import { setStatusBarStyle } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Button } from '@/components/Button'
import { isConfigured } from '@/lib/env'
import { supabase } from '@/lib/supabase'
import { openWeb } from '@/lib/web'
import { EDGE, colors, font } from '@/theme'

function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    if (!isConfigured) return
    supabase().auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase().auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])
  return session
}

function Field({ label, error, ...input }: { label: string; error?: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...input} accessibilityLabel={label} placeholderTextColor={colors.muted} style={styles.input} />
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    </View>
  )
}

/** Email sign-in validated on submit, with errors under the field they belong to. */
function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const next: typeof errors = {}
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter an email address like name@example.com.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    if (next.email || next.password) return
    setBusy(true)
    const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) setErrors({ form: error.message.includes('Invalid') ? 'That email and password don’t match.' : 'Unable to sign in. Check your connection and try again.' })
  }

  return (
    <View style={styles.stack}>
      <Text accessibilityRole="header" style={styles.title}>Sign in</Text>
      <Field label="Email" value={email} onChangeText={setEmail} error={errors.email} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" returnKeyType="next" />
      <Field label="Password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={submit} />
      {errors.form ? <Text style={styles.error}>{errors.form}</Text> : null}
      <Button block loading={busy} onPress={submit}>
        Sign in
      </Button>
      <Button block variant="quiet" onPress={() => openWeb('/signup')}>
        Create an account
      </Button>
    </View>
  )
}

function SignedIn({ session }: { session: Session }) {
  return (
    <View style={styles.stack}>
      <Text accessibilityRole="header" style={styles.title}>Account</Text>
      <Text style={styles.body}>{session.user.email}</Text>
      <Button block onPress={() => openWeb('/advisor')}>
        Find my card
      </Button>
      <Button block variant="quiet" onPress={() => openWeb('/dashboard')}>
        Open CardSense on the web
      </Button>
      <Button block variant="quiet" onPress={() => supabase().auth.signOut()}>
        Sign out
      </Button>
    </View>
  )
}

export default function Account() {
  const session = useSession()
  useFocusEffect(useCallback(() => setStatusBarStyle('dark'), []))

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        {!isConfigured ? (
          <Text style={styles.body}>Sign-in arrives once this build is connected to CardSense.</Text>
        ) : session ? (
          <SignedIn session={session} />
        ) : (
          <SignIn />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: EDGE, paddingTop: 72, paddingBottom: 40 },
  stack: { gap: 20 },
  title: { fontFamily: font.semibold, fontSize: 34, letterSpacing: -0.6, color: colors.pine },
  field: { gap: 6 },
  label: { fontFamily: font.medium, fontSize: 15, color: colors.pine },
  input: { minHeight: 50, borderRadius: 12, paddingHorizontal: 16, backgroundColor: colors.white, fontFamily: font.regular, fontSize: 17, color: colors.pine },
  // Errors are ink, as on the web: the four colours have no red.
  error: { fontFamily: font.medium, fontSize: 15, lineHeight: 21, color: colors.pine },
  body: { fontFamily: font.regular, fontSize: 17, lineHeight: 24, color: colors.pine },
})
