import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

import { MapPinIcon } from '@/components/icons';
import { AppText } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';

const TILE = 256;
const ZOOM = 16;

/** Koordinat piksel global (Web Mercator) pada zoom tertentu. */
function project(lat: number, lng: number, zoom: number) {
  const scale = TILE * 2 ** zoom;
  const sin = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

type Props = {
  latitude: number | null;
  longitude: number | null;
  style?: StyleProp<ViewStyle>;
};

/**
 * Peta singkat lokasi absen: potongan ubin OpenStreetMap yang dipusatkan pada
 * koordinat, dengan pin di tengah. Tanpa koordinat/jaringan, tampil kisi polos.
 */
export function MapPreview({ latitude, longitude, style }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const has = latitude != null && longitude != null;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height) setSize({ width, height });
  };

  let tiles: { key: string; uri: string; left: number; top: number }[] = [];
  if (has && size.width) {
    const p = project(latitude, longitude, ZOOM);
    const originX = p.x - size.width / 2;
    const originY = p.y - size.height / 2;
    const x0 = Math.floor(originX / TILE);
    const y0 = Math.floor(originY / TILE);
    const x1 = Math.floor((originX + size.width) / TILE);
    const y1 = Math.floor((originY + size.height) / TILE);
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        tiles.push({
          key: `${x}-${y}`,
          uri: `https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`,
          left: x * TILE - originX,
          top: y * TILE - originY,
        });
      }
    }
  }

  return (
    <View
      style={[styles.map, style]}
      onLayout={onLayout}
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        has ? `Peta lokasi absen di ${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : 'Lokasi tidak tersedia'
      }>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="map-grid" width={20} height={20} patternUnits="userSpaceOnUse">
            <Path d="M 20 0 L 0 0 0 20" fill="none" stroke={Colors.border} strokeWidth={1} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#map-grid)" />
      </Svg>
      {tiles.map((t) => (
        <Image
          key={t.key}
          source={t.uri}
          style={{ position: 'absolute', left: t.left, top: t.top, width: TILE, height: TILE }}
          transition={150}
        />
      ))}
      <View style={styles.pin} pointerEvents="none">
        <MapPinIcon size={30} weight="fill" color={Colors.text} />
      </View>
      {tiles.length > 0 && (
        <AppText style={styles.attribution} importantForAccessibility="no">
          © OpenStreetMap
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: { overflow: 'hidden', backgroundColor: Colors.surfaceSubtle },
  pin: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    // Ujung pin berada tepat di titik koordinat.
    paddingBottom: 30,
  },
  attribution: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.one,
    fontSize: 9,
    lineHeight: 12,
    color: Colors.textMuted,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
