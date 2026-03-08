import React from 'react';
import MapView, { Callout, Marker } from 'react-native-maps';
import { StyleSheet, Text, View } from 'react-native';

type MapPoint = {
  id: number;
  name: string;
  venue: string;
  latitude: number;
  longitude: number;
};

export default function EventMapNative({
  points,
  onPressPoint,
  onUserCoordChange,
  focusToken,
}: {
  points: MapPoint[];
  onPressPoint: (id: number) => void;
  onUserCoordChange: (coord: { latitude: number; longitude: number } | null) => void;
  focusToken?: number;
}) {
  const mapRef = React.useRef<MapView | null>(null);
  const [userCoord, setUserCoord] = React.useState<{ latitude: number; longitude: number } | null>(null);

  React.useEffect(() => {
    if (!focusToken || !userCoord) return;
    mapRef.current?.animateToRegion(
      {
        latitude: userCoord.latitude,
        longitude: userCoord.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      300,
    );
  }, [focusToken, userCoord]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      showsUserLocation
      onUserLocationChange={(e) => {
        const c = e.nativeEvent.coordinate;
        if (!c) return;
        const coord = { latitude: c.latitude, longitude: c.longitude };
        setUserCoord(coord);
        onUserCoordChange(coord);
      }}
      initialRegion={{
        latitude: 35.6812,
        longitude: 139.7671,
        latitudeDelta: 5.5,
        longitudeDelta: 5.5,
      }}>
      {points.map((p) => (
        <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }}>
          <Callout onPress={() => onPressPoint(p.id)}>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{p.name}</Text>
              <Text style={styles.calloutSub}>{p.venue}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  callout: { width: 180, paddingVertical: 2 },
  calloutTitle: { color: '#16134A', fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  calloutSub: { color: '#6B6899', fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
});
