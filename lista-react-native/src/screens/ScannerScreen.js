import React, { useState, useRef } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';
import { lookupBarcode, demoProduct } from '../services/openFoodFacts';

const { width } = Dimensions.get('window');

export default function ScannerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const lockRef = useRef(false);

  async function handleScan({ data }) {
    if (lockRef.current) return;
    lockRef.current = true;
    setBusy(true);
    const product = (await lookupBarcode(data)) || { ...demoProduct(), barcode: data };
    setBusy(false);
    navigation.replace('AddItem', { product });
  }

  function simulate() {
    if (lockRef.current) return;
    lockRef.current = true;
    navigation.replace('AddItem', { product: demoProduct() });
  }

  const granted = permission?.granted;

  return (
    <View style={styles.fill}>
      {/* top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable hitSlop={12} onPress={() => navigation.goBack()}>
          <Text style={styles.close}>{'\u2715'}</Text>
        </Pressable>
        <Text style={styles.topTitle}>I-scan ang barcode</Text>
        <Text style={styles.flash}>{'\u26A1'}</Text>
      </View>

      {/* camera / viewport */}
      <View style={styles.viewport}>
        {granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
            onBarcodeScanned={busy ? undefined : handleScan}
          />
        ) : (
          <View style={styles.permFallback}>
            <View style={styles.fakeProduct}>
              <Text style={styles.fakeProductText}>PANCIT  CANTON</Text>
              <Text style={styles.fakeBars}>·||·|·||||·|·||·|||·||·|·</Text>
            </View>
          </View>
        )}

        {/* viewfinder */}
        <View pointerEvents="none" style={styles.finder}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
        <Text style={styles.caption}>Itutok sa barcode ng produkto</Text>

        {busy && (
          <View style={styles.busy}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.busyText}>Hinahanap sa Open Food Facts…</Text>
          </View>
        )}
      </View>

      {/* bottom controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 28 }]}>
        {!granted && (
          <Pressable style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Payagan ang camera</Text>
          </Pressable>
        )}
        <Pressable style={styles.goldBtn} onPress={simulate}>
          <Text style={styles.goldBtnText}>Simulate scan {'\u2728'}</Text>
        </Pressable>
        <Pressable onPress={() => navigation.replace('AddItem', { product: demoProduct() })}>
          <Text style={styles.manual}>Walang camera? Mag-type na lang {'\u2192'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const FINDER = width * 0.6;

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#0C0E1C' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14 },
  close: { color: '#fff', fontSize: 24 },
  topTitle: { color: '#fff', fontSize: 15, fontFamily: fonts.bold },
  flash: { color: '#fff', fontSize: 18, opacity: 0.7 },

  viewport: { flex: 1, marginHorizontal: 28, borderRadius: 20, overflow: 'hidden', backgroundColor: '#13182b' },
  permFallback: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  fakeProduct: { width: 150, height: 90, borderRadius: 10, backgroundColor: '#2a2f48', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: 0.6 },
  fakeProductText: { fontSize: 11, color: '#7d83a0', letterSpacing: 3, fontFamily: fonts.bold },
  fakeBars: { color: '#7d83a0', fontSize: 12 },

  finder: { position: 'absolute', left: '50%', top: '50%', width: FINDER, height: FINDER * 0.7, marginLeft: -FINDER / 2, marginTop: -(FINDER * 0.7) / 2 },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: colors.gold },
  tl: { left: 0, top: 0, borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 8 },
  tr: { right: 0, top: 0, borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 8 },
  bl: { left: 0, bottom: 0, borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 8 },
  br: { right: 0, bottom: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 8 },
  caption: { position: 'absolute', bottom: 18, alignSelf: 'center', color: '#B9BED6', fontSize: 12.5, fontFamily: fonts.medium },

  busy: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(12,14,28,0.7)', alignItems: 'center', justifyContent: 'center', gap: 12 },
  busyText: { color: '#fff', fontFamily: fonts.semibold, fontSize: 13 },

  controls: { paddingHorizontal: 24, paddingTop: 18, gap: 13 },
  permBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  permBtnText: { color: '#fff', fontFamily: fonts.semibold, fontSize: 14 },
  goldBtn: { backgroundColor: colors.gold, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  goldBtnText: { color: colors.navy, fontFamily: fonts.extrabold, fontSize: 16 },
  manual: { textAlign: 'center', color: '#AEB4D2', fontSize: 13.5, fontFamily: fonts.semibold },
});
