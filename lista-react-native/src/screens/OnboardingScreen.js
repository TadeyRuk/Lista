import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, peso } from '../theme';
import { STORE } from '../data';
import { useApp } from '../context/AppContext';
import { createFundedAccount, shortKey } from '../services/stellar';
import SunMark from '../components/SunMark';
import { ShieldIcon } from '../components/Shield';

export default function OnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { setAccount } = useApp();
  const [step, setStep] = useState('create'); // create | funding | ready
  const [wallet, setWallet] = useState({ publicKey: '', secret: '' });

  async function startFunding() {
    setStep('funding');
    try {
      // Real testnet account + Friendbot funding. Falls back to a demo wallet
      // if the network is unavailable so onboarding never dead-ends.
      const acct = await createFundedAccount();
      setWallet(acct);
    } catch (e) {
      setWallet({ publicKey: 'GDEMO0000000000000000000000000000000000000000000A4F2', secret: '' });
    }
    setStep('ready');
  }

  function enterApp() {
    setAccount(wallet);
    navigation.replace('Home');
  }

  return (
    <LinearGradient colors={colors.gradient} style={styles.fill}>
      <View style={[styles.body, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }]}>
        <View style={{ alignItems: 'center' }}>
          <SunMark size={58} core="#FFFFFF" />
          <Text style={styles.wordmark}>Lista</Text>
          <Text style={styles.tagline}>Ang digital na lista ng tindahan mo.</Text>
        </View>

        <View style={styles.card}>
          {step === 'create' && (
            <View style={{ gap: 14 }}>
              <Text style={styles.fieldLabel}>Pangalan ng tindahan</Text>
              <View style={styles.input}>
                <Text style={styles.inputText}>{STORE.name}</Text>
                <Text style={styles.pencil}>{'\u270E'}</Text>
              </View>
              <View style={styles.helperRow}>
                <ShieldIcon size={14} color={colors.bayad} />
                <Text style={styles.helper}>
                  Gagawa kami ng secure na Stellar wallet para sa'yo. Walang bayad, walang hassle.
                </Text>
              </View>
              <Pressable style={styles.goldBtn} onPress={startFunding}>
                <Text style={styles.goldBtnText}>Magsimula</Text>
              </Pressable>
            </View>
          )}

          {step === 'funding' && (
            <View style={{ alignItems: 'center', gap: 16, paddingVertical: 6 }}>
              <ActivityIndicator size="large" color={colors.navy} />
              <Text style={styles.fundingTitle}>Ginagawa ang wallet mo…</Text>
              <View style={{ width: '100%', gap: 9 }}>
                <Step done text="Nagse-set up ng Stellar account" />
                <Step done text="Nililink sa Horizon API" />
                <Step text="Fini-fund via Friendbot…" />
              </View>
            </View>
          )}

          {step === 'ready' && (
            <View style={{ alignItems: 'center', gap: 14 }}>
              <View style={styles.checkCircle}>
                <Text style={styles.check}>{'\u2713'}</Text>
              </View>
              <Text style={styles.readyTitle}>Handa na ang Lista!</Text>
              <View style={styles.walletBox}>
                <Row k="Wallet" v={shortKey(wallet.publicKey)} mono />
                <Row k="Testnet balance" v="10,000 XLM" mono color={colors.bayad} />
              </View>
              <Pressable style={styles.navyBtn} onPress={enterApp}>
                <Text style={styles.navyBtnText}>Pumasok sa Lista</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.secure}>
          <ShieldIcon size={13} color={colors.onNavyFaint} />
          <Text style={styles.secureText}>Naka-secure sa Stellar Testnet</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function Step({ done, text }) {
  return (
    <View style={styles.stepRow}>
      <Text style={{ color: done ? colors.bayad : '#9a99a6', fontSize: 13 }}>{done ? '\u2713' : '\u25CB'}</Text>
      <Text style={[styles.stepText, !done && { color: '#9a99a6' }]}>{text}</Text>
    </View>
  );
}

function Row({ k, v, mono, color }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvKey}>{k}</Text>
      <Text style={[styles.kvVal, mono && { fontFamily: fonts.displayMd }, color && { color }]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 26, alignItems: 'center' },
  wordmark: { fontFamily: fonts.display, fontSize: 36, letterSpacing: -1, color: '#fff', marginTop: 14 },
  tagline: { color: colors.onNavyMuted, fontFamily: fonts.medium, fontSize: 14, marginTop: 4 },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    marginTop: 34,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  fieldLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  input: {
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.navy },
  pencil: { color: '#C9C3B5' },
  helperRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  helper: { flex: 1, fontSize: 12.5, fontFamily: fonts.medium, color: '#7C7B88', lineHeight: 18 },

  goldBtn: { marginTop: 6, backgroundColor: colors.gold, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  goldBtnText: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.navy },
  navyBtn: { width: '100%', backgroundColor: colors.navy, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  navyBtnText: { fontFamily: fonts.extrabold, fontSize: 16, color: '#fff' },

  fundingTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  stepRow: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  stepText: { fontSize: 13, fontFamily: fonts.medium, color: '#5b5a67' },

  checkCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.tintBayad, alignItems: 'center', justifyContent: 'center' },
  check: { fontSize: 30, color: colors.bayad, fontFamily: fonts.bold },
  readyTitle: { fontFamily: fonts.extrabold, fontSize: 19, color: colors.ink },
  walletBox: { width: '100%', backgroundColor: '#F7F5EF', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 13, gap: 7 },
  kv: { flexDirection: 'row', justifyContent: 'space-between' },
  kvKey: { fontSize: 12.5, fontFamily: fonts.medium, color: colors.muted },
  kvVal: { fontSize: 12.5, fontFamily: fonts.semibold, color: colors.navy },

  secure: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', gap: 6 },
  secureText: { color: colors.onNavyFaint, fontSize: 11.5, fontFamily: fonts.medium },
});
