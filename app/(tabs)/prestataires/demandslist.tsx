import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";

/* =======================
   TYPES
======================= */

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

/* =======================
   SCREEN
======================= */

export default function DemandsListScreen() {
  const router = useRouter();

  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"client" | "prestataire" | null>(null);

  useEffect(() => {
    init();
  }, []);

  /* =======================
     INIT
  ======================= */

  const init = async () => {
    const storedUser = await AsyncStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    setUserRole(user.role);

    loadDemands();
  };

  /* =======================
     LOAD DEMANDS
  ======================= */

  const loadDemands = async () => {
    try {
      const res = await api.get("/demands/me");
      setDemands(res.data);
    } catch (err) {
      console.log("❌ Load demands error", err);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     STATUS COLOR
  ======================= */

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

  if (!demands.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No demands found</Text>
      </View>
    );
  }

  /* =======================
     RENDER
  ======================= */

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={demands}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.header}>
            {userRole === "prestataire" ? "Incoming Demands" : "My Demands"}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "./demand-details",
                params: { id: item._id },
              })
            }
            style={styles.card}
          >
            {/* MESSAGE */}
            <Text style={styles.message}>💬 {item.message}</Text>

            {/* STATUS */}
            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.status,
                  { color: getStatusColor(item.status) },
                ]}
              >
                ● {item.status.toUpperCase()}
              </Text>
            </View>

            {/* DATE */}
            <Text style={styles.date}>
              📅 {new Date(item.createdAt).toLocaleDateString()} at{" "}
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>

            {/* ROLE LABEL */}
            <Text style={styles.roleLabel}>
              {userRole === "prestataire"
                ? "From client"
                : "To prestataire"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

/* =======================
   STYLES
======================= */

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
  list: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
    color: "#111827",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  statusContainer: {
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  date: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  roleLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
});