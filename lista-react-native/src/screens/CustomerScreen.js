import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, peso } from '../theme';
import { STORE } from '../data';
import { useApp } from '../context/AppContext';
import SunMark from '../components/SunMark';
import TxRow from '../components/TxRow';
import { VerifiedBadge } from '../components/Shield';

// The connected SUKI view — the customer's own read-only window into the same
// on-chain ledger. Reinforces the shared-truth promise of Lista.
export default function CustomerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { activeCustomer, activeLedger, setPerspective } = useApp();

  function backToStore() {
    setPerspective('store');
    navigation.goBack();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      {/* store header */}
      <View style={styles.head}>
        <View style={styles.storeAvatar}>
          <SunMark size={22} core={colors.navy} ray={colors.navy} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headLabel}>Ang utang mo kay</Text>
          <Text style={styles.headStore}>{STORE.name}</Text>
        </View>
        <VerifiedBadge label="verified" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: insets.bottom + 24 }}>
        <View style={styles.balanceWrap}>
          <Text style={styles.balanceLabel}>Kabuuang utang mo</Text>
          <Text style={styles.balanceAmount}>{peso(activeCustomer.balance)}</Text>
        </View>

        <View style={styles.trust}>
          <Text style={styles.trustEmoji}>{'\u{1F91D}'}</Text>
          <Text style={styles.trustText}>
            Pareho kayong nakakakita ng <Text style={{ fontFamily: fonts.bold }}>parehong listahan</Text> ni Aling
            Nena. Hindi ito mababago ng kahit sino — naka-record sa Stellar.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Kasaysayan</Text>
        <View style={{ gap: 9 }}>
          {activeLedger.map((e) => (
            <TxRow key={e.id} entry={e} />
          ))}
        </View>

        <Pressable style={styles.backBtn} onPress={backToStore}>
          <Text style={styles.backText}>{'\u2190'}  Balik sa view ng tindera</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  storeAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  headLabel: { fontSize: 11, fontFamily: fonts.medium, color: colors.muted },
  headStore: { fontSize: 15, fontFamily: fonts.extrabold, color: colors.ink },

  balanceWrap: { alignItems: 'center', paddingTop: 6, paddingBottom: 16 },
  balanceLabel: { fontSize: 13, fontFamily: fonts.semibold, color: colors.muted },
  balanceAmount: { fontFamily: fonts.display, fontSize: 46, letterSpacing: -1, color: colors.ink, marginTop: 2 },

  trust: { backgroundColor: colors.tintNavy, borderWidth: 1, borderColor: colors.tintNavyBorder, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 15, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  trustEmoji: { fontSize: 16 },
  trustText: { flex: 1, fontSize: 12.5, fontFamily: fonts.medium, color: '#3B4684', lineHeight: 19 },

  sectionTitle: { marginTop: 18, marginBottom: 10, marginHorizontal: 2, fontSize: 14, fontFamily: fonts.extrabold, color: colors.ink },

  backBtn: { marginTop: 18, alignItems: 'center', paddingVertical: 12 },
  backText: { fontSize: 13, fontFamily: fonts.semibold, color: colors.muted },
});
