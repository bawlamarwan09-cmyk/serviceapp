import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";

/* =======================
   TYPES
======================= */

type Demand = {
  _id: string;
  status: "pending" | "accepted" | "rejected";
  serviceId?: {
    _id: string;
    name: string;
    price?: number;
  };
  clientId: string;
  prestataireId: string;
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
      default:
        return "#D97706";
    }
  };

  /* =======================
     UI STATES
  ======================= */

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!demands.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No demands found</Text>
      </View>
    );
  }

  /* =======================
     RENDER
  ======================= */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
      <FlatList
        data={demands}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              marginBottom: 16,
              color: "#111827",
            }}
          >
            {userRole === "prestataire"
              ? "Incoming Demands"
              : "My Demands"}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/demand-details",
                params: { demandId: item._id },
              })
            }
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 18,
              marginBottom: 14,
              elevation: 3,
            }}
          >
            {/* SERVICE */}
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              {item.serviceId?.name || "Service"}
            </Text>

            {/* PRICE */}
            {item.serviceId?.price !== undefined && (
              <Text style={{ marginTop: 4, color: "#6B7280" }}>
                Price: {item.serviceId.price} MAD
              </Text>
            )}

            {/* STATUS */}
            <Text
              style={{
                marginTop: 8,
                fontWeight: "700",
                color: getStatusColor(item.status),
              }}
            >
              Status: {item.status}
            </Text>

            {/* ROLE LABEL */}
            <Text
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "#6B7280",
              }}
            >
              {userRole === "prestataire"
                ? "Requested by client"
                : "Sent to prestataire"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
