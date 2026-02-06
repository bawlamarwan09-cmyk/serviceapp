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
};

export default function PrestataireDemandDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [demand, setDemand] = useState<Demand | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadDemand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDemand = async () => {
    try {
      if (!id) return;
      setLoading(true);

      // ✅ demand واحد بالـ id (ماشي /demands/me)
      const res = await api.get(`/demands/me`);
      setDemand(res.data);
    } catch (err) {
      console.log("❌ loadDemand error", err);
      Alert.alert("Error", "Demand not found");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: "accepted" | "rejected") => {
    if (!id) return;

    setUpdating(true);
    try {
      await api.patch(`/demands/${id}/status`, { status });
      Alert.alert("Success", `Demand ${status}`);
      await loadDemand();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.msg || "Failed to update status");
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

  if (!demand) {
    return (
      <View style={styles.center}>
        <Text>Demand not loaded</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Incoming Demand</Text>

        <View
          style={[
            styles.badge,
            { backgroundColor: getStatusColor(demand.status) + "20" },
          ]}
        >
          <Text style={[styles.badgeText, { color: getStatusColor(demand.status) }]}>
            ● {demand.status}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💬 Message</Text>
          <Text style={styles.message}>{demand.message}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{demand.clientId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Service:</Text>
            <Text style={styles.value}>{demand.serviceId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>
              {new Date(demand.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* ✅ ACTIONS (always enabled, only blocked while updating) */}
        <View style={styles.actions}>
          <TouchableOpacity
            disabled={updating}
            onPress={() => updateStatus("accepted")}
            style={[styles.btn, styles.accept, updating && styles.disabled]}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>✅ Accept</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={updating}
            onPress={() => updateStatus("rejected")}
            style={[styles.btn, styles.reject, updating && styles.disabled]}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>❌ Reject</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: "800", color: "#111827", marginBottom: 14 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: { fontSize: 13, fontWeight: "800" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10, color: "#111827" },
  message: { fontSize: 15, color: "#374151", lineHeight: 22, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "#6B7280", fontWeight: "700", flex: 1 },
  value: { color: "#111827", flex: 2, textAlign: "right" },
  actions: { gap: 12, marginTop: 6 },
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  accept: { backgroundColor: "#16A34A" },
  reject: { backgroundColor: "#DC2626" },
  disabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
