import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts, peso, shadow } from '../theme';
import { STORE } from '../data';
import { useApp } from '../context/AppContext';
import SunMark from '../components/SunMark';
import { ShieldIcon } from '../components/Shield';
import BottomNav from '../components/BottomNav';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { customers, totalReceivable, setActiveId, setPerspective } = useApp();

  function openSuki(id) {
    setActiveId(id);
    navigation.navigate('TabViewer');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24 }}>
        {/* greeting */}
        <View style={styles.greetRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetSmall}>Magandang umaga,</Text>
            <Text style={styles.storeName}>{STORE.name}</Text>
          </View>
          <View style={styles.logoCircle}>
            <SunMark size={22} />
          </View>
        </View>

        {/* hero */}
        <View style={[styles.hero, shadow.hero]}>
          <View style={styles.heroWatermark} pointerEvents="none">
            <SunMark size={150} ray="rgba(244,181,60,0.13)" core="rgba(244,181,60,0.13)" />
          </View>
          <Text style={styles.heroLabel}>Makukolekta lahat</Text>
          <Text style={styles.heroAmount}>{peso(totalReceivable)}</Text>
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroMeta}>{customers.length} suki · {totalTx(customers)} transaksyon · </Text>
            <ShieldIcon size={12} color="#8FE3C0" />
            <Text style={[styles.heroMeta, { color: '#8FE3C0', marginLeft: 4 }]}>on-chain</Text>
          </View>
        </View>

        {/* quick actions */}
        <View style={styles.actions}>
          <Pressable style={[styles.action, { backgroundColor: colors.gold }]} onPress={() => navigation.navigate('Scanner')}>
            <ScanIcon stroke={colors.navy} />
            <Text style={[styles.actionText, { color: colors.navy, fontFamily: fonts.extrabold }]}>I-scan</Text>
          </Pressable>
          <Pressable style={[styles.action, styles.actionGhost]} onPress={() => navigation.navigate('AddItem')}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.navy} strokeWidth={2.1} strokeLinecap="round">
              <Path d="M12 5v14M5 12h14" />
            </Svg>
            <Text style={styles.actionText}>Bagong utang</Text>
          </Pressable>
          <Pressable style={[styles.action, styles.actionGhost]} onPress={() => navigation.navigate('TabViewer')}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.navy} strokeWidth={2.1} strokeLinecap="round">
              <Path d="M4 6h16M4 12h16M4 18h10" />
            </Svg>
            <Text style={styles.actionText}>Mga lista</Text>
          </Pressable>
        </View>

        {/* suki list */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Mga suki</Text>
          <Text style={styles.sectionLink}>Tingnan lahat</Text>
        </View>

        <View style={{ gap: 10 }}>
          {customers.map((c) => (
            <Pressable key={c.id} style={styles.sukiRow} onPress={() => openSuki(c.id)}>
              <View style={[styles.avatar, { backgroundColor: c.avatarBg }]}>
                <Text style={styles.avatarText}>{c.initial}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.sukiName}>{c.name}</Text>
                <Text style={styles.sukiSub} numberOfLines={1}>{c.sub}</Text>
              </View>
              <Text style={[styles.sukiBal, { color: c.balance === 0 ? colors.bayad : colors.utang }]}>
                {c.balance === 0 ? 'Bayad na' : peso(c.balance)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* perspective switch */}
        <Pressable
          style={styles.switchRow}
          onPress={() => { setActiveId('tonyo'); setPerspective('customer'); navigation.navigate('Customer'); }}
        >
          <Text style={styles.switchText}>{'\u{1F9CD}'}  Tingnan bilang suki (Mang Tonyo)  {'\u2192'}</Text>
        </Pressable>
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom }}>
        <BottomNav navigation={navigation} />
      </View>
    </View>
  );
}

function totalTx(customers) {
  // rough display count
  return 8;
}

function ScanIcon({ stroke }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2.1} strokeLinecap="round">
      <Path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <Path d="M3 12h18" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  greetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  greetSmall: { fontSize: 13, fontFamily: fonts.medium, color: colors.muted },
  storeName: { fontSize: 19, fontFamily: fonts.extrabold, color: colors.ink, letterSpacing: -0.2 },
  logoCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },

  hero: { backgroundColor: colors.navy, borderRadius: 24, padding: 22, overflow: 'hidden' },
  heroWatermark: { position: 'absolute', top: -36, right: -30 },
  heroLabel: { color: colors.onNavyMuted, fontSize: 13, fontFamily: fonts.semibold },
  heroAmount: { fontFamily: fonts.display, color: '#fff', fontSize: 44, letterSpacing: -1, marginTop: 2 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  heroMeta: { color: colors.onNavyFaint, fontSize: 12.5, fontFamily: fonts.medium },

  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  action: { flex: 1, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', gap: 7 },
  actionGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.borderWarm },
  actionText: { fontSize: 13.5, fontFamily: fonts.bold, color: colors.navy },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12, paddingHorizontal: 2 },
  sectionTitle: { fontSize: 15, fontFamily: fonts.extrabold, color: colors.ink },
  sectionLink: { fontSize: 13, fontFamily: fonts.semibold, color: colors.navy },

  sukiRow: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontFamily: fonts.bold },
  sukiName: { fontSize: 15, fontFamily: fonts.bold, color: colors.ink },
  sukiSub: { fontSize: 12, fontFamily: fonts.medium, color: colors.mutedSoft },
  sukiBal: { fontSize: 16, fontFamily: fonts.display },

  switchRow: { marginTop: 18, alignItems: 'center', paddingVertical: 12 },
  switchText: { fontSize: 13, fontFamily: fonts.semibold, color: colors.muted },
});
