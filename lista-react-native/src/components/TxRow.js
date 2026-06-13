import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, peso } from '../theme';

// One transaction row in a tab/ledger timeline.
// Shared between the tindera's TabViewer and the suki's CustomerScreen.
export default function TxRow({ entry, balance, onPress, showChevron }) {
  const isUtang = entry.utang;
  const color = isUtang ? colors.utang : colors.bayad;
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? { opacity: 0.7 } : null]}
    >
      <View style={[styles.icon, { backgroundColor: isUtang ? colors.tintUtang : colors.tintBayad }]}>
        <Text style={[styles.iconChar, { color }]}>{isUtang ? '\u2191' : '\u2193'}</Text>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.item} numberOfLines={1}>{entry.item}</Text>
        <Text style={styles.meta}>{entry.date} · {entry.time}</Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.amount, { color }]}>
          {(isUtang ? '+' : '\u2212') + peso(entry.amount)}
        </Text>
        {balance != null ? (
          <Text style={styles.bal}>Bal {peso(balance)}</Text>
        ) : null}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChar: { fontSize: 17, fontFamily: fonts.bold },
  item: { fontSize: 14, fontFamily: fonts.bold, color: colors.ink },
  meta: { fontSize: 11.5, fontFamily: fonts.medium, color: colors.mutedSoft, marginTop: 1 },
  amount: { fontSize: 15, fontFamily: fonts.display },
  bal: { fontSize: 10.5, fontFamily: fonts.medium, color: '#B6B4C0', marginTop: 1 },
});
