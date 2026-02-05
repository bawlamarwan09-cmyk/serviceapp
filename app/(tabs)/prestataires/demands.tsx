import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import api from "../../services/api";

type Demande = {
  _id: string;
  clientId: string;
  prestataireId: string;
  serviceId: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function PrestataireDashboard() {
  const router = useRouter();

  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      if (user.role !== "prestataire") {
        router.replace("/login");
        return;
      }

      const res = await api.get("/demands/me");

      setDemandes(res.data);
    } catch (error) {
      console.error("Error loading demands:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!demandes.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No demands yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={demandes}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.message}>💬 {item.message}</Text>
          <Text style={styles.detail}>📋 Status: {item.status}</Text>
          <Text style={styles.detail}>
            📅 {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
});