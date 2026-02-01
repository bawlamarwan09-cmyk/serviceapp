import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
    Alert,
    Button,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Props = {
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
};

export default function LocationPicker({ onLocationSelected }: Props) {
  const [location, setLocation] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please enable location services');
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;

      setLocation({ latitude, longitude });

      // Get address from coordinates
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`.trim();
        setAddress(fullAddress);
      }

    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get location');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!location) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    onLocationSelected({
      latitude: location.latitude,
      longitude: location.longitude,
      address: address || 'Meeting location',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Meeting Location</Text>

      <TouchableOpacity
        onPress={getCurrentLocation}
        style={styles.button}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Getting location...' : '📍 Use Current Location'}
        </Text>
      </TouchableOpacity>

      {location && (
        <>
          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Meeting Point"
            />
          </MapView>

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address or description"
            style={styles.input}
            multiline
          />

          <Button title="Confirm Location" onPress={handleConfirm} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  map: {
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
});