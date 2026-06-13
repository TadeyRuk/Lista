import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, peso } from '../theme';
import { runningBalances, STORE } from '../data';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import TxRow from '../components/TxRow';
import { ShieldIcon, VerifiedBadge } from '../components/Shield';

export default function TabViewerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { activeCustomer, activeLedger, sendSmsReminder } = useApp();
  const balances = runningBalances(activeLedger);

  function triggerSms() {
    const phone = activeCustomer.phone || '+639123456789';
    const message = `Magandang araw, ${activeCustomer.name}! Paalala mula kay ${STORE.name} na ang iyong utang ay nagkakahalaga ng ${peso(activeCustomer.balance)}. Maaari itong i-settle sa store o on-chain. Salamat!`;
    
    // Simulate notification on suki side
    sendSmsReminder(activeCustomer.id);
    
    // Trigger native SMS app
    const url = `sms:${phone}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          alert(`Hindi mabuksan ang SMS app sa device na ito.\n\nReminder text:\n"${message}"`);
        }
      })
      .catch((err) => console.error('Error sending SMS:', err));
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <Header
        title={activeCustomer.name}
        onBack={() => navigation.goBack()}
        subtitle={<VerifiedBadge />}
        right={<Text style={styles.dots}>{'\u22EF'}</Text>}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: insets.bottom + 24 }}>
        {/* balance hero */}
        <View style={styles.balanceWrap}>
          <Text style={styles.balanceLabel}>Utang ngayon</Text>
          <Text style={styles.balanceAmount}>{peso(activeCustomer.balance)}</Text>
        </View>

        {/* actions */}
        <View style={{ gap: 12 }}>
          <View style={styles.actions}>
            <Pressable style={[styles.btn, { backgroundColor: colors.bayad }]} onPress={() => navigation.navigate('Bayad')}>
              <Text style={styles.btnText}>Bayad</Text>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: colors.navy }]} onPress={() => navigation.navigate('AddItem')}>
              <Text style={styles.btnText}>Dagdag utang</Text>
            </Pressable>
          </View>
          
          {activeCustomer.balance > 0 && (
            <Pressable style={styles.remindBtn} onPress={triggerSms}>
              <Text style={styles.remindBtnText}>📱 Magpadala ng SMS Reminder</Text>
            </Pressable>
          )}
        </View>

        {/* trust strip */}
        <View style={styles.trust}>
          <ShieldIcon size={14} color={colors.navy} />
          <Text style={styles.trustText}>
            Na-rebuild ang balanse mula sa{' '}
            <Text style={{ fontFamily: fonts.bold }}>{activeLedger.length} Stellar transactions</Text>. Walang local database.
          </Text>
        </View>

        {/* timeline */}
        <View style={{ gap: 9, marginTop: 8 }}>
          {activeLedger.map((e, i) => (
            <TxRow
              key={e.id}
              entry={e}
              balance={balances[i]}
              showChevron
              onPress={() => navigation.navigate('Receipt', { entryId: e.id })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { color: colors.mutedSoft, fontSize: 20 },
  balanceWrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 18 },
  balanceLabel: { fontSize: 13, fontFamily: fonts.semibold, color: colors.muted },
  balanceAmount: { fontFamily: fonts.display, fontSize: 46, letterSpacing: -1, color: colors.utang, marginTop: 2 },

  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontFamily: fonts.extrabold, fontSize: 15 },

  remindBtn: {
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  remindBtnText: {
    color: colors.navy,
    fontFamily: fonts.bold,
    fontSize: 14,
  },

  trust: { marginVertical: 18, flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: colors.tintNavy, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 13 },
  trustText: { flex: 1, fontSize: 12, fontFamily: fonts.medium, color: '#3B4684', lineHeight: 17 },
});
