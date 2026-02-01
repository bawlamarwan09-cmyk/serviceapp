import type { AxiosError } from "axios";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../services/api";

/* =======================
   TYPES
======================= */

type Service = {
  _id: string;
  name: string;
  price?: number;
};

type Prestataire = {
  _id: string;
  name: string;
  experience: number;
  city?: string;
  availability?: boolean; // ✅ correct field
};

type ServiceWithPrestatairesResponse = {
  service: Service;
  prestataires: Prestataire[];
};

/* =======================
   SCREEN
======================= */

export default function PrestatairesScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();

  const [service, setService] = useState<Service | null>(null);
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    fetchPrestataires();
  }, [serviceId]);

  /* =======================
     FETCH PRESTATAIRES
  ======================= */

  const fetchPrestataires = async () => {
    try {
      const res = await api.get<ServiceWithPrestatairesResponse>(
        `/catalog/services/${serviceId}/with-prestataires`
      );

      setService(res.data.service);
      setPrestataires(res.data.prestataires);
    } catch (err) {
  const error = err as AxiosError<any>;

  Alert.alert(
    "Error",
    error.response?.data?.msg || "Failed to load prestataires"
  );
}
 finally {
      setLoading(false);
    }
  };

  /* =======================
     CREATE DEMAND (RESERVE)
  ======================= */

  const handleReserve = async (prestataireId: string) => {
    try {
      setSendingId(prestataireId);

      await api.post("/demands", {
        prestataireId,
        serviceId,
        message: `Reservation request for ${service?.name}`,
      });

      Alert.alert("✅ Success", "Reservation sent successfully");

    } catch (err) {
      const error = err as AxiosError<any>;
      Alert.alert(
        "Reservation failed",
        error.response?.data?.msg || "Something went wrong"
      );
    } finally {
      setSendingId(null);
    }
  };
  const confirmReserve = (prestataireId: string) => {
  Alert.alert(
    "Confirm reservation",
    "Do you want to send this reservation request?",
    [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => handleReserve(prestataireId),
      },
    ],
    { cancelable: true }
  );
};

  /* =======================
     UI STATES
  ======================= */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!prestataires.length) {
    return (
      <View style={styles.center}>
        <Text>No prestataires available for this service</Text>
      </View>
    );
  }

  /* =======================
     RENDER
  ======================= */

  return (
    <FlatList
      data={prestataires}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        service ? (
          <Text style={styles.header}>{service.name}</Text>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          {/* NAME */}
          <Text style={styles.name}>{item.name}</Text>

          {/* EXPERIENCE */}
          <Text style={styles.text}>
            Experience: {item.experience} years
          </Text>

          {/* CITY */}
          {item.city && (
            <Text style={styles.text}>City: {item.city}</Text>
          )}

          {/* PRICE */}
          {service?.price && (
            <Text style={styles.price}>
              Price: {service.price} DH
            </Text>
          )}

          {/* AVAILABILITY */}
          <Text
            style={[
              styles.status,
              { color: item.availability ? "#16A34A" : "#DC2626" },
            ]}
          >
            {item.availability ? "Available" : "Unavailable"}
          </Text>

          {/* RESERVE BUTTON */}
         <TouchableOpacity
            disabled={!item.availability || sendingId === item._id}
            onPress={() => confirmReserve(item._id)}
            style={[
              styles.reserveBtn,
              {
                backgroundColor:
                  !item.availability || sendingId === item._id
                    ? "#9CA3AF"
                    : "#2563EB",
              },
            ]}
          >
            {sendingId === item._id ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.reserveText}>Reserve</Text>
            )}
          </TouchableOpacity>

        </View>
      )}
    />
  );
}

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  price: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },
  status: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
  },
  reserveBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  reserveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
