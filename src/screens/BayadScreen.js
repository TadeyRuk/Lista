import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, peso } from '../theme';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

export default function BayadScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { activeCustomer, addBayad } = useApp();
  const [amount, setAmount] = useState(100);

  function confirm() {
    addBayad(activeCustomer.id, Math.min(amount, activeCustomer.balance));
    navigation.replace('TabViewer');
  }

  const chips = [
    { label: '\u20B150', value: 50 },
    { label: '\u20B1100', value: 100 },
    { label: 'Buong utang', value: activeCustomer.balance, wide: true },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <Header title="Tanggapin ang bayad" onBack={() => navigation.goBack()} />

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 22 }}>
        <View style={styles.sukiChip}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{activeCustomer.initial}</Text>
          </View>
          <Text style={styles.sukiText}>
            {activeCustomer.name} · utang {peso(activeCustomer.balance)}
          </Text>
        </View>

        <View style={styles.amountWrap}>
          <Text style={styles.amountLabel}>Halaga ng bayad</Text>
          <Text style={styles.amount}>{peso(amount)}</Text>
        </View>

        <View style={styles.chips}>
          {chips.map((c) => {
            const active = amount === c.value;
            return (
              <Pressable
                key={c.label}
                style={[styles.chip, c.wide && styles.chipWide, active && styles.chipActive]}
                onPress={() => setAmount(c.value)}
              >
                <Text style={[styles.chipText, active && { color: colors.navy }]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.hint}>I-type ang halagang binayad ng suki</Text>

        {/* simple keypad */}
        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '\u232B'].map((k) => (
            <Pressable
              key={k}
              style={styles.key}
              onPress={() => {
                setAmount((cur) => {
                  if (k === 'C') return 0;
                  if (k === '\u232B') return Math.floor(cur / 10);
                  return Math.min(cur * 10 + Number(k), 999999);
                });
              }}
            >
              <Text style={styles.keyText}>{k}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        <Pressable style={[styles.cta, amount <= 0 && { opacity: 0.4 }]} disabled={amount <= 0} onPress={confirm}>
          <Text style={styles.ctaText}>Tanggapin ang bayad · {peso(amount)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sukiChip: { flexDirection: 'row', alignItems: 'center', gap: 11, justifyContent: 'center' },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: fonts.bold, fontSize: 14 },
  sukiText: { fontSize: 14, fontFamily: fonts.bold, color: colors.ink },

  amountWrap: { alignItems: 'center', paddingTop: 26, paddingBottom: 20 },
  amountLabel: { fontSize: 13, fontFamily: fonts.semibold, color: colors.muted },
  amount: { fontFamily: fonts.display, fontSize: 54, letterSpacing: -1.5, color: colors.bayad, marginTop: 4 },

  chips: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  chip: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.borderWarm, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 18 },
  chipWide: { backgroundColor: colors.tintNavy, borderColor: colors.tintNavyBorder },
  chipActive: { borderColor: colors.navy, backgroundColor: colors.tintNavy },
  chipText: { fontFamily: fonts.bold, color: colors.navy, fontSize: 14 },

  hint: { marginTop: 18, textAlign: 'center', fontSize: 12, fontFamily: fonts.medium, color: colors.mutedSoft },

  keypad: { marginTop: 22, flexDirection: 'row', flexWrap: 'wrap' },
  key: { width: '33.333%', height: 56, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontFamily: fonts.displayMd, fontSize: 24, color: colors.ink },

  footer: { paddingHorizontal: 20, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  cta: { backgroundColor: colors.bayad, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  ctaText: { fontFamily: fonts.extrabold, fontSize: 16.5, color: '#fff' },
});
