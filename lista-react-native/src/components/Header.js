import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

// Reusable top app bar for inner screens (back chevron, centered title, optional right slot).
export default function Header({ title, subtitle, onBack, right }) {
  return (
    <View style={styles.bar}>
      {onBack ? (
        <Pressable hitSlop={12} onPress={onBack} style={styles.back}>
          <Text style={styles.chevron}>{'\u2039'}</Text>
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}

      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <View style={styles.sub}>{subtitle}</View> : null}
      </View>

      {right ? <View style={styles.side}>{right}</View> : <View style={styles.side} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  back: { width: 36, alignItems: 'flex-start', justifyContent: 'center' },
  side: { width: 36, alignItems: 'flex-end' },
  chevron: { fontSize: 26, color: colors.ink, lineHeight: 26, marginTop: -2 },
  center: { flex: 1, alignItems: 'center' },
  title: { fontSize: 16, fontFamily: fonts.extrabold, color: colors.ink },
  sub: { marginTop: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
