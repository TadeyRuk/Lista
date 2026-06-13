import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, peso } from '../theme';
import { runningBalances } from '../data';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import TxRow from '../components/TxRow';
import { ShieldIcon, VerifiedBadge } from '../components/Shield';

export default function TabViewerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { 
    activeCustomer, 
    activeLedger, 
    initializingCustomer, 
    loadingLedger, 
    initCustomerAccount, 
    refreshActiveLedger 
  } = useApp();

  const balances = runningBalances(activeLedger);

  useEffect(() => {
    if (activeCustomer && !activeCustomer.publicKey) {
      initCustomerAccount(activeCustomer.id);
    } else {
      refreshActiveLedger();
    }
  }, [activeCustomer.id]);

  if (initializingCustomer) {
    return (
      <View style={[styles.center, { backgroundColor: colors.paper }]}>
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={styles.loadingText}>
          Fini-fund ang account ni {activeCustomer.name} via Friendbot…
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <Header
        title={activeCustomer.name}
        onBack={() => navigation.goBack()}
        subtitle={<VerifiedBadge />}
        right={
          loadingLedger ? (
            <ActivityIndicator size="small" color={colors.navy} />
          ) : (
            <Text style={styles.dots}>{'\u22EF'}</Text>
          )
        }
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: insets.bottom + 24 }}>
        {/* balance hero */}
        <View style={styles.balanceWrap}>
          <Text style={styles.balanceLabel}>Utang ngayon</Text>
          <Text style={styles.balanceAmount}>{peso(activeCustomer.balance)}</Text>
        </div>

        {/* actions */}
        <View style={styles.actions}>
          <Pressable style={[styles.btn, { backgroundColor: colors.bayad }]} onPress={() => navigation.navigate('Bayad')}>
            <Text style={styles.btnText}>Bayad</Text>
          </Pressable>
          <Pressable style={[styles.btn, { backgroundColor: colors.navy }]} onPress={() => navigation.navigate('AddItem')}>
            <Text style={styles.btnText}>Dagdag utang</Text>
          </Pressable>
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
          {activeLedger.length === 0 ? (
            <Text style={styles.emptyText}>Walang transaksyon sa timeline na ito.</Text>
          ) : (
            activeLedger.map((e, i) => (
              <TxRow
                key={e.id}
                entry={e}
                balance={balances[i]}
                showChevron
                onPress={() => navigation.navigate('Receipt', { entryId: e.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { color: colors.mutedSoft, fontSize: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 14, fontSize: 14, fontFamily: fonts.semibold, color: colors.navy, textAlign: 'center' },
  emptyText: { textAlign: 'center', color: colors.muted, fontSize: 13, fontFamily: fonts.medium, paddingVertical: 24 },
  balanceWrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 18 },
  balanceLabel: { fontSize: 13, fontFamily: fonts.semibold, color: colors.muted },
  balanceAmount: { fontFamily: fonts.display, fontSize: 46, letterSpacing: -1, color: colors.utang, marginTop: 2 },

  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontFamily: fonts.extrabold, fontSize: 15 },

  trust: { marginVertical: 18, flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: colors.tintNavy, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 13 },
  trustText: { flex: 1, fontSize: 12, fontFamily: fonts.medium, color: '#3B4684', lineHeight: 17 },
});
