import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, peso } from '../theme';
import { DEMO_PRODUCT } from '../data';
import { useApp } from '../context/AppContext';
import { buildMemo } from '../services/stellar';
import Header from '../components/Header';

export default function AddItemScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { activeCustomer, addUtang } = useApp();
  const [submitting, setSubmitting] = useState(false);

  const product = route.params?.product || DEMO_PRODUCT;
  const [price, setPrice] = useState(product.price ?? DEMO_PRODUCT.price);
  const [qty, setQty] = useState(1);

  const slug = product.slug || 'item';
  const lineTotal = price * qty;
  const memo = buildMemo('utang', slug, lineTotal);

  async function confirm() {
    setSubmitting(true);
    try {
      const label = qty > 1 ? `${product.name} \u00D7${qty}` : product.name;
      await addUtang(activeCustomer.id, label, lineTotal);
      navigation.replace('TabViewer');
    } catch (e) {
      alert("Hindi ma-record ang utang: " + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top }}>
      <Header title="Idagdag sa utang" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 }}>
        {/* product card */}
        <View style={styles.productCard}>
          <View style={styles.thumb}>
            {product.image ? (
              <Image source={{ uri: product.image }} style={styles.thumbImg} />
            ) : (
              <Text style={styles.thumbText}>PANCIT{'\n'}CANTON</Text>
            )}
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productBrand}>{product.brand || '—'}</Text>
            <Text style={styles.offTag}>{'\u2713'} Open Food Facts · {product.barcode}</Text>
          </View>
        </View>

        {/* price + qty */}
        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>Presyo bawat piraso</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.priceValue}>{peso(price)}</Text>
              <Text style={styles.pencil}>  {'\u270E'}</Text>
            </View>
          </View>
          <View style={styles.stepper}>
            <Pressable style={[styles.stepBtn, styles.stepMinus]} onPress={() => setQty((q) => Math.max(1, q - 1))}>
              <Text style={styles.stepMinusText}>{'\u2212'}</Text>
            </Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable style={[styles.stepBtn, styles.stepPlus]} onPress={() => setQty((q) => Math.min(99, q + 1))}>
              <Text style={styles.stepPlusText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* assign suki */}
        <View style={styles.assignCard}>
          <View style={[styles.assignAvatar]}>
            <Text style={styles.assignAvatarText}>{activeCustomer.initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.assignLabel}>Isusulat sa utang ni</Text>
            <Text style={styles.assignName}>{activeCustomer.name}</Text>
          </View>
          <Text style={styles.assignChange}>Palitan</Text>
        </View>

        {/* memo preview */}
        <View style={styles.memoCard}>
          <Text style={styles.memoLabel}>MAI-RE-RECORD ON-CHAIN</Text>
          <Text style={styles.memoText}>{memo}</Text>
        </div>
      </ScrollView>

      {/* footer CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        <Pressable 
          style={[styles.cta, submitting && { opacity: 0.7 }]} 
          onPress={confirm}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.navy} />
          ) : (
            <Text style={styles.ctaText}>Idagdag sa utang · {peso(lineTotal)}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  productCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center' },
  thumb: { width: 64, height: 64, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumbImg: { width: 64, height: 64 },
  thumbText: { fontSize: 9, fontFamily: fonts.extrabold, color: '#7a4a00', textAlign: 'center', lineHeight: 11 },
  productName: { fontSize: 16, fontFamily: fonts.extrabold, color: colors.ink, lineHeight: 19 },
  productBrand: { fontSize: 12, fontFamily: fonts.medium, color: colors.mutedSoft, marginTop: 2 },
  offTag: { fontSize: 11, fontFamily: fonts.semibold, color: colors.bayad, marginTop: 6 },

  priceCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 18, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifycontent: 'space-between' },
  priceLabel: { fontSize: 12, fontFamily: fonts.semibold, color: colors.muted },
  priceValue: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  pencil: { fontSize: 13, color: '#C9C3B5' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#F7F5EF', borderRadius: 14, padding: 8 },
  stepBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepMinus: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.borderWarm },
  stepMinusText: { fontSize: 20, color: colors.navy, lineHeight: 22 },
  stepPlus: { backgroundColor: colors.navy },
  stepPlusText: { fontSize: 20, color: '#fff', lineHeight: 22 },
  qty: { fontFamily: fonts.display, fontSize: 19, color: colors.ink, minWidth: 20, textAlign: 'center' },

  assignCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  assignAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  assignAvatarText: { color: '#fff', fontFamily: fonts.bold },
  assignLabel: { fontSize: 11, fontFamily: fonts.medium, color: colors.muted },
  assignName: { fontSize: 15, fontFamily: fonts.bold, color: colors.ink },
  assignChange: { fontSize: 13, fontFamily: fonts.semibold, color: colors.navy },

  memoCard: { marginTop: 16, backgroundColor: '#11142B', borderRadius: 14, paddingVertical: 13, paddingHorizontal: 15 },
  memoLabel: { fontSize: 10.5, fontFamily: fonts.semibold, color: '#8E96C4', marginBottom: 5, letterSpacing: 0.5 },
  memoText: { fontFamily: fonts.displayMd, fontSize: 13, color: '#9FE7C6' },

  footer: { paddingHorizontal: 20, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.paper },
  cta: { backgroundColor: colors.gold, paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', height: 52 },
  ctaText: { fontFamily: fonts.extrabold, fontSize: 16.5, color: colors.navy },
});
