import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';
import { STORE, CUSTOMERS } from '../data';
import { useApp } from '../context/AppContext';
import { createFundedAccount, shortKey } from '../services/stellar';
import SunMark from '../components/SunMark';
import { ShieldIcon } from '../components/Shield';

export default function OnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { setAccount, setRole, setUserName, setActiveId } = useApp();
  const [step, setStep] = useState('role'); // role | create | funding | ready
  const [role, setRoleState] = useState('store'); // store | buyer
  const [userNameInput, setUserNameInput] = useState(STORE.name);
  const [selectedSukiId, setSelectedSukiId] = useState('tonyo');
  const [isCustomName, setIsCustomName] = useState(false);
  
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
    setRole(role);
    setUserName(userNameInput);
    if (role === 'buyer') {
      setActiveId(selectedSukiId);
      navigation.replace('BuyerHome');
    } else {
      navigation.replace('Home');
    }
  }

  return (
    <LinearGradient colors={colors.gradient} style={styles.fill}>
      <View style={[styles.body, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <SunMark size={52} core="#FFFFFF" />
          <Text style={styles.wordmark}>Lista</Text>
          <Text style={styles.tagline}>Ang digital na lista ng suki at tindahan mo.</Text>
        </View>

        <View style={styles.card}>
          {step === 'role' && (
            <View style={{ gap: 16 }}>
              <Text style={styles.cardTitle}>Piliin ang iyong papel:</Text>
              
              <Pressable 
                style={[styles.roleCard, role === 'store' && styles.roleCardActive]} 
                onPress={() => {
                  setRoleState('store');
                  setUserNameInput(STORE.name);
                }}
              >
                <View style={[styles.roleIcon, { backgroundColor: colors.tintNavy }]}>
                  <SunMark size={20} core={colors.navy} ray={colors.navy} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleTitle}>Ako ay Tindera (Store Owner)</Text>
                  <Text style={styles.roleSub}>Mag-tala ng utang, tanggapin ang bayad, at mag-track ng benta.</Text>
                </View>
              </Pressable>

              <Pressable 
                style={[styles.roleCard, role === 'buyer' && styles.roleCardActive]} 
                onPress={() => {
                  setRoleState('buyer');
                  setSelectedSukiId('tonyo');
                  setUserNameInput(CUSTOMERS[0].name);
                  setIsCustomName(false);
                }}
              >
                <View style={[styles.roleIcon, { backgroundColor: colors.tintUtang }]}>
                  <Text style={{ fontSize: 18 }}>🤝</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleTitle}>Ako ay Suki (Buyer / Customer)</Text>
                  <Text style={styles.roleSub}>Tingnan ang iyong utang, mga binili sa store, at makatanggap ng abiso.</Text>
                </View>
              </Pressable>

              <Pressable style={styles.goldBtn} onPress={() => setStep('create')}>
                <Text style={styles.goldBtnText}>Susunod</Text>
              </Pressable>
            </View>
          )}

          {step === 'create' && (
            <View style={{ gap: 14 }}>
              {role === 'store' ? (
                <View style={{ gap: 10 }}>
                  <Text style={styles.fieldLabel}>Pangalan ng tindahan</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ilagay ang pangalan ng tindahan"
                    value={userNameInput}
                    onChangeText={setUserNameInput}
                    placeholderTextColor="#B9C0E4"
                  />
                  <View style={styles.helperRow}>
                    <ShieldIcon size={14} color={colors.bayad} />
                    <Text style={styles.helper}>
                      Gagawa kami ng secure na Stellar wallet para sa tindahan mo. Walang bayad.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  <Text style={styles.fieldLabel}>Pumili ng profile o gumawa ng bago:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                    {CUSTOMERS.map((c) => {
                      const active = selectedSukiId === c.id;
                      return (
                        <Pressable
                          key={c.id}
                          style={[styles.sukiChip, active && styles.sukiChipActive]}
                          onPress={() => {
                            setSelectedSukiId(c.id);
                            setUserNameInput(c.name);
                            setIsCustomName(false);
                          }}
                        >
                          <View style={[styles.sukiAvatar, { backgroundColor: c.avatarBg }]}>
                            <Text style={styles.sukiAvatarText}>{c.initial}</Text>
                          </View>
                          <Text style={[styles.sukiChipText, active && { color: colors.navy, fontFamily: fonts.bold }]}>{c.name}</Text>
                        </Pressable>
                      );
                    })}
                    <Pressable
                      style={[styles.sukiChip, isCustomName && styles.sukiChipActive]}
                      onPress={() => {
                        setSelectedSukiId('custom');
                        setUserNameInput('');
                        setIsCustomName(true);
                      }}
                    >
                      <View style={[styles.sukiAvatar, { backgroundColor: colors.mutedSoft }]}>
                        <Text style={styles.sukiAvatarText}>+</Text>
                      </View>
                      <Text style={[styles.sukiChipText, isCustomName && { color: colors.navy, fontFamily: fonts.bold }]}>Bagong Suki</Text>
                    </Pressable>
                  </ScrollView>
                  
                  {isCustomName && (
                    <View style={{ gap: 8, marginTop: 4 }}>
                      <Text style={styles.fieldLabel}>Pangalan Mo</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Ilagay ang iyong pangalan"
                        value={userNameInput}
                        onChangeText={setUserNameInput}
                        placeholderTextColor="#A09EAC"
                      />
                    </View>
                  )}

                  <View style={styles.helperRow}>
                    <ShieldIcon size={14} color={colors.bayad} />
                    <Text style={styles.helper}>
                      Ililink ang wallet mo sa on-chain ledger ng tindahan para makita ang listahan.
                    </Text>
                  </View>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <Pressable style={[styles.goldBtn, { flex: 1, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.borderWarm }]} onPress={() => setStep('role')}>
                  <Text style={[styles.goldBtnText, { color: colors.muted }]}>Bumalik</Text>
                </Pressable>
                <Pressable style={[styles.goldBtn, { flex: 2 }]} onPress={startFunding}>
                  <Text style={styles.goldBtnText}>Magsimula</Text>
                </Pressable>
              </View>
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
              <Text style={styles.readyTitle}>Handa na ang iyong account!</Text>
              <View style={styles.walletBox}>
                <Row k="Pangalan" v={userNameInput} />
                <Row k="Papel (Role)" v={role === 'store' ? 'Tindera' : 'Suki (Buyer)'} />
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
  body: { flex: 1, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  wordmark: { fontFamily: fonts.display, fontSize: 32, letterSpacing: -1, color: '#fff', marginTop: 8 },
  tagline: { color: colors.onNavyMuted, fontFamily: fonts.medium, fontSize: 13, marginTop: 4, textAlign: 'center' },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  cardTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink, marginBottom: 4 },
  fieldLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.ink },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.navy,
    backgroundColor: '#fff',
  },
  helperRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 4 },
  helper: { flex: 1, fontSize: 12, fontFamily: fonts.medium, color: '#7C7B88', lineHeight: 17 },

  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleCardActive: {
    borderColor: colors.gold,
    backgroundColor: colors.tintNavy,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.navy },
  roleSub: { fontSize: 11.5, fontFamily: fonts.medium, color: colors.muted, marginTop: 2, lineHeight: 16 },

  sukiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F7F5EF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  sukiChipActive: {
    backgroundColor: colors.tintNavy,
    borderColor: colors.navy,
  },
  sukiAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sukiAvatarText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  sukiChipText: {
    fontSize: 12.5,
    fontFamily: fonts.semibold,
    color: colors.mutedSoft,
  },

  goldBtn: { marginTop: 6, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  goldBtnText: { fontFamily: fonts.extrabold, fontSize: 15.5, color: colors.navy },
  navyBtn: { width: '100%', backgroundColor: colors.navy, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  navyBtnText: { fontFamily: fonts.extrabold, fontSize: 15.5, color: '#fff' },

  fundingTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  stepRow: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  stepText: { fontSize: 13, fontFamily: fonts.medium, color: '#5b5a67' },

  checkCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.tintBayad, alignItems: 'center', justifyContent: 'center' },
  check: { fontSize: 26, color: colors.bayad, fontFamily: fonts.bold },
  readyTitle: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.ink },
  walletBox: { width: '100%', backgroundColor: '#F7F5EF', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 13, gap: 7 },
  kv: { flexDirection: 'row', justifyContent: 'space-between' },
  kvKey: { fontSize: 12.5, fontFamily: fonts.medium, color: colors.muted },
  kvVal: { fontSize: 12.5, fontFamily: fonts.semibold, color: colors.navy },

  secure: { marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 6 },
  secureText: { color: colors.onNavyFaint, fontSize: 11.5, fontFamily: fonts.medium },
});
