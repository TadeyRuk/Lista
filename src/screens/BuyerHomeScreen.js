import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts, peso, shadow } from '../theme';
import { STORE, CUSTOMERS, runningBalances } from '../data';
import { useApp } from '../context/AppContext';
import SunMark from '../components/SunMark';
import TxRow from '../components/TxRow';
import { ShieldIcon, VerifiedBadge } from '../components/Shield';
import { server, shortKey } from '../services/stellar';

export default function BuyerHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { 
    activeCustomer, 
    activeLedger, 
    setPerspective, 
    notifications, 
    markNotificationsAsRead,
    account 
  } = useApp();

  const [activeTab, setActiveTab] = useState('lista'); // lista | abiso
  const [balanceXlm, setBalanceXlm] = useState('10,000');
  
  // Custom store linking state
  const [linkedStores, setLinkedStores] = useState([
    { id: 'aling_nena', name: STORE.name, balance: activeCustomer.balance, ledger: activeLedger }
  ]);
  const [activeStoreId, setActiveStoreId] = useState('aling_nena');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreKey, setNewStoreKey] = useState('');

  // Fetch real XLM balance if account is available
  useEffect(() => {
    if (account?.publicKey) {
      server.loadAccount(account.publicKey)
        .then((acct) => {
          const nativeBal = acct.balances.find((b) => b.asset_type === 'native');
          if (nativeBal) {
            setBalanceXlm(Number(nativeBal.balance).toLocaleString('en-US', { maximumFractionDigits: 2 }));
          }
        })
        .catch(() => {});
    }
  }, [account]);

  // Synchronize Aling Nena's balance if the ledger changes (e.g. tindera added a transaction)
  useEffect(() => {
    setLinkedStores(prev => 
      prev.map(s => 
        s.id === 'aling_nena' 
          ? { ...s, balance: activeCustomer.balance, ledger: activeLedger } 
          : s
      )
    );
  }, [activeCustomer.balance, activeLedger]);

  // Calculate unread notifications
  const userNotifs = notifications[activeCustomer.id] || [];
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  // Mark as read when entering notifications tab
  useEffect(() => {
    if (activeTab === 'abiso') {
      markNotificationsAsRead(activeCustomer.id);
    }
  }, [activeTab, userNotifs, activeCustomer.id]);

  function switchRole() {
    setPerspective('store');
    navigation.replace('Home');
  }

  function handleLinkStore() {
    if (!newStoreName.trim()) return;
    const newId = 'store_' + Date.now();
    setLinkedStores((prev) => [
      ...prev,
      {
        id: newId,
        name: newStoreName.trim(),
        balance: 0,
        ledger: []
      }
    ]);
    setActiveStoreId(newId);
    setNewStoreName('');
    setNewStoreKey('');
    setShowLinkModal(false);
  }

  const currentStore = linkedStores.find((s) => s.id === activeStoreId) || linkedStores[0];
  const currentBalances = runningBalances(currentStore.ledger);

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: activeCustomer.avatarBg }]}>
          <Text style={styles.avatarText}>{activeCustomer.initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.greet}>Magandang araw,</Text>
          <Text style={styles.userName}>{activeCustomer.name}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.xlmLabel}>Stellar Wallet</Text>
          <Text style={styles.xlmValue}>{balanceXlm} XLM</Text>
        </View>
      </View>

      {/* Main Body */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24 }}>
        {/* Total Debt Hero Card */}
        <View style={[styles.hero, shadow.hero]}>
          <View style={styles.heroWatermark} pointerEvents="none">
            <SunMark size={140} ray="rgba(255,255,255,0.06)" core="rgba(255,255,255,0.06)" />
          </View>
          <Text style={styles.heroLabel}>KABUUANG UTANG MO</Text>
          <Text style={styles.heroAmount}>
            {peso(linkedStores.reduce((acc, s) => acc + s.balance, 0))}
          </Text>
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroMeta}>
              sa {linkedStores.length} tindahan · {currentStore.ledger.length} transaksyon · 
            </Text>
            <ShieldIcon size={12} color="#8FE3C0" />
            <Text style={[styles.heroMeta, { color: '#8FE3C0', marginLeft: 4 }]}>on-chain verified</Text>
          </View>
        </View>

        {/* Tab Controls */}
        <View style={styles.tabsContainer}>
          <Pressable 
            style={[styles.tabButton, activeTab === 'lista' && styles.tabButtonActive]}
            onPress={() => setActiveTab('lista')}
          >
            <Text style={[styles.tabText, activeTab === 'lista' && styles.tabTextActive]}>
              Lista & Tindahan
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.tabButton, activeTab === 'abiso' && styles.tabButtonActive]}
            onPress={() => setActiveTab('abiso')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.tabText, activeTab === 'abiso' && styles.tabTextActive]}>
                Mga Abiso
              </Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>

        {/* TAB 1: LISTA & TINDAHAN */}
        {activeTab === 'lista' && (
          <View style={{ gap: 14 }}>
            {/* Horizontal Stores List */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.sectionTitle}>Iyong mga Tindahan</Text>
                <Pressable onPress={() => setShowLinkModal(true)}>
                  <Text style={styles.linkActionText}>+ Mag-link</Text>
                </Pressable>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
                {linkedStores.map((s) => {
                  const isActive = s.id === activeStoreId;
                  return (
                    <Pressable
                      key={s.id}
                      style={[styles.storeChip, isActive && styles.storeChipActive]}
                      onPress={() => setActiveStoreId(s.id)}
                    >
                      <Text style={[styles.storeChipName, isActive && { color: colors.navy, fontFamily: fonts.bold }]}>
                        {s.name}
                      </Text>
                      <Text style={[styles.storeChipBal, { color: s.balance > 0 ? colors.utang : colors.bayad }]}>
                        {s.balance === 0 ? '₱0.00' : peso(s.balance)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Selected Store Ledger */}
            <View style={styles.ledgerSection}>
              <View style={styles.storeHeader}>
                <View style={styles.storeIcon}>
                  <Text style={{ fontSize: 16 }}>🏪</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storeName}>{currentStore.name}</Text>
                  <Text style={styles.storeSub}>
                    {currentStore.balance === 0 ? 'Bayad lahat ang utang' : `Utang: ${peso(currentStore.balance)}`}
                  </Text>
                </View>
                <VerifiedBadge label="Stellar" />
              </View>

              {currentStore.ledger.length === 0 ? (
                <View style={styles.emptyLedger}>
                  <Text style={styles.emptyEmoji}>🎉</Text>
                  <Text style={styles.emptyTitle}>Walang Utang Dito</Text>
                  <Text style={styles.emptySub}>Wala kang kasalukuyang utang sa tindahan na ito.</Text>
                </View>
              ) : (
                <View style={{ gap: 9, marginTop: 10 }}>
                  {currentStore.ledger.map((e, i) => (
                    <TxRow
                      key={e.id}
                      entry={e}
                      balance={currentBalances[i]}
                      showChevron
                      onPress={() => navigation.navigate('Receipt', { entryId: e.id })}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* TAB 2: MGA ABISO */}
        {activeTab === 'abiso' && (
          <View style={{ gap: 10 }}>
            <Text style={styles.sectionTitle}>Mga Abiso at Alert sa Utang</Text>
            {userNotifs.length === 0 ? (
              <View style={styles.emptyNotifs}>
                <Text style={{ fontSize: 32 }}>🔔</Text>
                <Text style={styles.emptyTitle}>Walang Abiso</Text>
                <Text style={styles.emptySub}>Malinis ang notification center mo sa ngayon.</Text>
              </View>
            ) : (
              userNotifs.map((n) => (
                <View key={n.id} style={[styles.notifCard, !n.read && styles.notifUnread]}>
                  <View style={[styles.notifIcon, { backgroundColor: n.type === 'utang' ? colors.tintUtang : colors.tintBayad }]}>
                    <Text style={{ fontSize: 14, color: n.type === 'utang' ? colors.utang : colors.bayad }}>
                      {n.type === 'utang' ? '📈' : '📉'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.notifTitle}>{n.title}</Text>
                      {!n.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifBody}>{n.body}</Text>
                    <Text style={styles.notifTime}>{n.date} · {n.time}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Switch back switcher */}
        <Pressable style={styles.switchRow} onPress={switchRole}>
          <Text style={styles.switchText}>
            🔄  Tingnan bilang Tindera (Aling Nena's)  →
          </Text>
        </Pressable>
      </ScrollView>

      {/* Link Store Modal */}
      <Modal visible={showLinkModal} transparent animationType="fade" onRequestClose={() => setShowLinkModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mag-link ng Tindahan</Text>
            <Text style={styles.modalDesc}>
              Ilagay ang detalye ng sari-sari store para ma-link ang on-chain ledger ng iyong utang.
            </Text>
            
            <View style={{ gap: 12, width: '100%', marginVertical: 14 }}>
              <View style={{ gap: 4 }}>
                <Text style={styles.inputLabel}>Pangalan ng Tindahan</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Tindahan ni Mang Tomas"
                  value={newStoreName}
                  onChangeText={setNewStoreName}
                  placeholderTextColor="#A09EAC"
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={styles.inputLabel}>Store Public Key (Stellar Wallet Address)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="G..."
                  value={newStoreKey}
                  onChangeText={setNewStoreKey}
                  placeholderTextColor="#A09EAC"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.borderWarm }]} 
                onPress={() => setShowLinkModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.muted }]}>Banselahin</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalBtn, { backgroundColor: colors.navy }]} 
                onPress={handleLinkStore}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>I-link</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingHorizontal: 20, 
    paddingBottom: 12, 
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderBottomColor: colors.border 
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  avatarText: { 
    color: '#fff', 
    fontSize: 15, 
    fontFamily: fonts.bold 
  },
  greet: { 
    fontSize: 11, 
    fontFamily: fonts.medium, 
    color: colors.muted 
  },
  userName: { 
    fontSize: 15, 
    fontFamily: fonts.extrabold, 
    color: colors.ink 
  },
  xlmLabel: { 
    fontSize: 10, 
    fontFamily: fonts.semibold, 
    color: colors.muted, 
    textAlign: 'right' 
  },
  xlmValue: { 
    fontSize: 12.5, 
    fontFamily: fonts.displayMd, 
    color: colors.bayad, 
    marginTop: 2 
  },

  hero: { 
    backgroundColor: colors.navyDeep, 
    borderRadius: 22, 
    padding: 20, 
    overflow: 'hidden', 
    marginBottom: 16 
  },
  heroWatermark: { 
    position: 'absolute', 
    bottom: -30, 
    right: -25 
  },
  heroLabel: { 
    color: colors.onNavyMuted, 
    fontSize: 11, 
    fontFamily: fonts.semibold, 
    letterSpacing: 0.5 
  },
  heroAmount: { 
    fontFamily: fonts.display, 
    color: '#fff', 
    fontSize: 40, 
    letterSpacing: -1, 
    marginTop: 2 
  },
  heroMetaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 6 
  },
  heroMeta: { 
    color: colors.onNavyFaint, 
    fontSize: 12, 
    fontFamily: fonts.medium 
  },

  tabsContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#ECE6DA', 
    borderRadius: 12, 
    padding: 3, 
    marginBottom: 16 
  },
  tabButton: { 
    flex: 1, 
    paddingVertical: 9, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderRadius: 9
  },
  tabButtonActive: { 
    backgroundColor: '#fff' 
  },
  tabText: { 
    fontSize: 13, 
    fontFamily: fonts.bold, 
    color: colors.muted 
  },
  tabTextActive: { 
    color: colors.navy 
  },
  badge: {
    backgroundColor: colors.utang,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9.5,
    fontFamily: fonts.bold,
  },

  sectionTitle: { 
    fontSize: 14, 
    fontFamily: fonts.extrabold, 
    color: colors.ink 
  },
  linkActionText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.navy
  },
  
  storeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 110,
    gap: 2
  },
  storeChipActive: {
    borderColor: colors.navy,
    backgroundColor: colors.tintNavy
  },
  storeChipName: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.mutedSoft
  },
  storeChipBal: {
    fontSize: 13,
    fontFamily: fonts.displayMd
  },

  ledgerSection: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    marginTop: 4
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderWarm,
    paddingBottom: 10,
    marginBottom: 6
  },
  storeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.tintNavy,
    alignItems: 'center',
    justifyContent: 'center'
  },
  storeName: {
    fontSize: 13.5,
    fontFamily: fonts.extrabold,
    color: colors.ink
  },
  storeSub: {
    fontSize: 11.5,
    fontFamily: fonts.medium,
    color: colors.muted,
    marginTop: 1
  },

  emptyLedger: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6
  },
  emptyEmoji: {
    fontSize: 26
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.ink
  },
  emptySub: {
    fontSize: 11.5,
    fontFamily: fonts.medium,
    color: colors.mutedSoft,
    textAlign: 'center'
  },

  emptyNotifs: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 36,
    alignItems: 'center',
    gap: 8
  },

  notifCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  notifUnread: {
    borderColor: colors.tintNavyBorder,
    backgroundColor: colors.tintNavy
  },
  notifIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notifTitle: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
    color: colors.ink
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.utang,
    marginLeft: 6
  },
  notifBody: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 16
  },
  notifTime: {
    fontSize: 10.5,
    fontFamily: fonts.medium,
    color: colors.mutedSoft,
    marginTop: 5
  },

  switchRow: { 
    marginTop: 20, 
    alignItems: 'center', 
    paddingVertical: 12 
  },
  switchText: { 
    fontSize: 13, 
    fontFamily: fonts.semibold, 
    color: colors.muted 
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 29, 68, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: fonts.extrabold,
    color: colors.navy
  },
  modalDesc: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.navy,
    backgroundColor: '#fff',
    width: '100%'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 10
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  modalBtnText: {
    fontSize: 13.5,
    fontFamily: fonts.bold
  }
});
