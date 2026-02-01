import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";

type Service = {
  _id: string;
  name: string;
  icon?: string;
  price?: number;
};

export default function ServicesScreen() {
  const { categoryId, categoryName } =
    useLocalSearchParams<{ categoryId: string; categoryName?: string }>();

  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;

    const loadServices = async () => {
      try {
        const res = await api.get("/catalog/services", {
          params: { category: categoryId },
        });
        setServices(res.data);
      } catch (err) {
        console.log("❌ Error loading services", err);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [categoryId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", marginBottom: 20 }}>
          {categoryName || "Services"}
        </Text>

        {loading ? (
          <ActivityIndicator />
        ) : services.length === 0 ? (
          <Text>No services in this category</Text>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {services.map((srv) => (
              <TouchableOpacity
                key={srv._id}
                onPress={() =>
                  router.push({
                    pathname: "/prestataires",
                    params: { serviceId: srv._id },
                  })
                }
                style={{
                  width: "48%",
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  paddingVertical: 22,
                  alignItems: "center",
                  marginBottom: 14,
                  elevation: 4,
                }}
              >
                <Text style={{ fontSize: 26 }}>{srv.icon || "🔧"}</Text>
                <Text style={{ marginTop: 8, fontWeight: "600" }}>
                  {srv.name}
                </Text>
                {srv.price !== undefined && (
                  <Text style={{ marginTop: 4, fontSize: 12, color: "#6B7280" }}>
                    From {srv.price} MAD
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
