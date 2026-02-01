import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Text,
    View,
} from "react-native";
import api from "../services/api";

type Demand = {
  _id: string;
  status: string;
  serviceId?: {
    name: string;
    price?: number;
  };
  clientId: string;
  prestataireId: string;
};

export default function DemandDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [demand, setDemand] = useState<Demand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemand();
  }, []);

  const loadDemand = async () => {
    try {
      const res = await api.get("/demands/me");

      // ✅ Find the demand by ID
      const found = res.data.find((d: Demand) => d._id === id);

      if (!found) {
        Alert.alert("Error", "Demand not found");
        router.back();
        return;
      }

      setDemand(found);
    } catch (err) {
      console.log("❌ Load demand error", err);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: "accepted" | "rejected") => {
    try {
      await api.put(`/demands/${id}/status`, { status });
      Alert.alert("Success", `Demand ${status}`);
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!demand) return null;

  return (
    <View style={{ padding: 20 }}>
      {/* SERVICE */}
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        🛠 {demand.serviceId?.name || "Service"}
      </Text>

      {/* PRICE */}
      {demand.serviceId?.price !== undefined && (
        <Text>💰 {demand.serviceId.price} MAD</Text>
      )}

      {/* STATUS */}
      <Text style={{ marginTop: 10 }}>
        📌 Status: {demand.status}
      </Text>

      {/* ACTIONS (PRESTATAIRE ONLY) */}
      {demand.status === "pending" && (
        <View style={{ marginTop: 20 }}>
          <Button title="✅ Accept" onPress={() => updateStatus("accepted")} />
          <View style={{ height: 10 }} />
          <Button title="❌ Reject" onPress={() => updateStatus("rejected")} />
        </View>
      )}
    </View>
  );
}
