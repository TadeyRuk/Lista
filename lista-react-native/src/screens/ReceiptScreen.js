import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, peso } from '../theme';
import { STORE } from '../data';
import { useApp } from '../context/AppContext';
import { buildMemo, shortKey } from '../services/stellar';
import Header from '../components/Header';
import { ShieldIcon } from '../components/Shield';

export default function ReceiptScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { activeCustomer, activeLedger, account } = useApp();

  const entry =
    activeLedger.find((e) => e.id === route.params?.entryId) || activeLedger[0];

  const isUtang = entry.utang;
  const type = isUtang ? 'Utang' : 'Bayad';
  const slug = entry.item.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 16);
  const memo = buildMemo(isUtang ? 'utang' : 'bayad', slug, entry.amount);

  const fromKey = account?.publicKey ? shortKey(account.publicKey) : STORE.walletShort;

  return (
    <View style={{ flex: 1, backgroundColor: colors.paperAlt, paddingTop: insets.top }}>
      <Header title="Resibo" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 10, paddingBottom: insets.bottom + 24 }}>
        <View style={styles.receipt}>
          {/* verified header */}
          <View style={styles.verifyHead}>
            <View style={styles.shieldCircle}>
              <ShieldIcon size={24} color={colors.bayad} />
            </View>
            <Text style={styles.verifyTitle}>Verified on Stellar Testnet</Text>
            <Text style={styles.verifySub}>Tamper-evident · hindi na mababago</Text>
          </View>

          <Dashed />

          <View style={{ paddingVertical: 18, gap: 13 }}>
            <Row k="Uri" v={type} vColor={isUtang ? colors.utang : colors.bayad} bold />
            <Row k="Item" v={entry.item} />
            <Row k="Halaga" v={peso(entry.amount)} mono bold />
            <View style={{ gap: 4 }}>
              <Text style={styles.k}>Memo</Text>
              <Text style={styles.memo}>{memo}</Text>
            </View>
            <Row k="Mula (tindera)" v={fromKey} mono />
            <Row k="Para kay (suki)" v={activeCustomer.walletShort} mono />
            <Row k="Ledger" v={entry.ledger ? '#' + entry.ledger.toLocaleString('en-US') : 'pending…'} mono />
            <Row k="Tx hash" v={entry.txHash + '  \u29C9'} mono />
            <Row k="Petsa" v={`${entry.date}, 2026 · ${entry.time}`} />
            <Row k="Network fee" v="0.00001 XLM" mono />
          </View>

          <Dashed />

          <Pressable style={styles.expertBtn}>
            <Text style={styles.expertText}>Buksan sa Stellar Expert {'\u2197'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ k, v, mono, bold, vColor }) {
  return (
    <View style={styles.row}>
      <Text style={styles.k}>{k}</Text>
      <Text
        style={[
          styles.v,
          mono && { fontFamily: fonts.displayMd },
          bold && { fontFamily: mono ? fonts.display : fonts.bold },
          vColor && { color: vColor },
        ]}
        numberOfLines={1}
      >
        {v}
      </Text>
    </View>
  );
}

function Dashed() {
  return <View style={styles.dashed} />;
}

const styles = StyleSheet.create({
  receipt: { backgroundColor: '#fff', borderRadius: 18, padding: 22, shadowColor: '#161A33', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 4 },
  verifyHead: { alignItems: 'center', gap: 8, paddingBottom: 18 },
  shieldCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.tintBayad, alignItems: 'center', justifyContent: 'center' },
  verifyTitle: { fontSize: 15, fontFamily: fonts.extrabold, color: colors.bayad },
  verifySub: { fontSize: 11.5, fontFamily: fonts.medium, color: colors.mutedSoft },

  dashed: { borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.borderWarm },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  k: { fontSize: 13.5, fontFamily: fonts.medium, color: colors.muted },
  v: { fontSize: 13.5, fontFamily: fonts.semibold, color: colors.ink, flexShrink: 1, textAlign: 'right' },
  memo: { fontFamily: fonts.displayMd, fontSize: 12, color: colors.navy, backgroundColor: '#F2F1FA', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },

  expertBtn: { marginTop: 16, borderWidth: 1, borderColor: colors.navy, borderRadius: 13, paddingVertical: 13, alignItems: 'center' },
  expertText: { fontFamily: fonts.bold, fontSize: 14, color: colors.navy },
});
