import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";

type Demand = {
  _id: string;
  clientId: string;
  prestataireId: string;
  serviceId: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  location?: {
    type: string;
    coordinates?: number[];
    address?: string;
    confirmedBy?: string;
    confirmedAt?: string;
  };
  appointmentDate?: string;
};

export default function DemandDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [demand, setDemand] = useState<Demand | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadDemand();
  }, [id]);

  const loadDemand = async () => {
    try {
      const res = await api.get(`/demands/me`);
      setDemand(res.data);
    } catch (err) {
      console.log("❌ Load demand error", err);
      Alert.alert("Error", "Demand not found");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: "accepted" | "rejected") => {
    setUpdating(true);
    try {
      await api.patch(`/demands/${id}/status`, { status });
      Alert.alert("Success", `Demand ${status}`);
      loadDemand(); // Reload to show updated status
    } catch (err) {
      Alert.alert("Error", "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "#16A34A";
      case "rejected":
        return "#DC2626";
      case "completed":
        return "#2563EB";
      case "cancelled":
        return "#6B7280";
      default:
        return "#D97706";
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!demand) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* HEADER */}
        <Text style={styles.title}>Demand Details</Text>

        {/* STATUS BADGE */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(demand.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(demand.status) },
            ]}
          >
            ● {demand.status}
          </Text>
        </View>

        {/* MESSAGE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Message</Text>
          <Text style={styles.message}>{demand.message}</Text>
        </View>

        {/* DEMAND INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Demand Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Demand ID:</Text>
            <Text style={styles.value}>{demand._id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>
              {new Date(demand.createdAt).toLocaleString()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Last Updated:</Text>
            <Text style={styles.value}>
              {new Date(demand.updatedAt).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* CLIENT INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Client Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Client ID:</Text>
            <Text style={styles.value}>{demand.clientId}</Text>
          </View>
        </View>

        {/* SERVICE INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠 Service Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Service ID:</Text>
            <Text style={styles.value}>{demand.serviceId}</Text>
          </View>
        </View>

        {/* PRESTATAIRE INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Prestataire Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Prestataire ID:</Text>
            <Text style={styles.value}>{demand.prestataireId}</Text>
          </View>
        </View>

        {/* LOCATION INFO */}
        {demand.location?.coordinates && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Location</Text>
            
            {demand.location.address && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{demand.location.address}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.label}>Coordinates:</Text>
              <Text style={styles.value}>
                {demand.location.coordinates[1]}, {demand.location.coordinates[0]}
              </Text>
            </View>

            {demand.location.confirmedBy && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Confirmed by:</Text>
                <Text style={styles.value}>{demand.location.confirmedBy}</Text>
              </View>
            )}
          </View>
        )}

        {/* APPOINTMENT DATE */}
        {demand.appointmentDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Appointment</Text>
            <Text style={styles.value}>
              {new Date(demand.appointmentDate).toLocaleString()}
            </Text>
          </View>
        )}

        {/* ACTION BUTTONS */}
        {demand.status === "pending" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => updateStatus("accepted")}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>✅ Accept</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => updateStatus("rejected")}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>❌ Reject</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: "#111827",
    flex: 2,
    textAlign: "right",
  },
  actions: {
    gap: 12,
    marginTop: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#16A34A",
  },
  rejectButton: {
    backgroundColor: "#DC2626",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});