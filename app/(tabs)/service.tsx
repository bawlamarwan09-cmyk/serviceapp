import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
  description?: string;
  price?: number;
};

export default function ServiceScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;

    const loadService = async () => {
      try {
        const res = await api.get(`/services/${serviceId}`);
        setService(res.data);
      } catch (err) {
        console.log("Error loading service", err);
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceId]);

  return (
    <SafeAreaView className="flex-1 bg-[#F6F7FB]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* LOADING */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : !service ? (
          <Text>Service not found</Text>
        ) : (
          <>
            {/* TITLE */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: "#111827",
              }}
            >
              {service.name}
            </Text>

            {/* PRICE */}
            {service.price && (
              <Text
                style={{
                  fontSize: 18,
                  color: "#2563EB",
                  marginTop: 6,
                }}
              >
                ${service.price}
              </Text>
            )}

            {/* DESCRIPTION */}
            {service.description && (
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginTop: 10,
                }}
              >
                {service.description}
              </Text>
            )}

            {/* APARTMENT SIZE (STATIC UI) */}
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                Apartment Size
              </Text>

              <View style={{ flexDirection: "row", marginTop: 12 }}>
                {["Small", "Medium", "Large"].map((item) => (
                  <View
                    key={item}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      marginRight: 12,
                    }}
                  >
                    <Text>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ROOMS */}
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                Number of Rooms
              </Text>

              <View style={{ flexDirection: "row", marginTop: 12 }}>
                {[1, 2, 3].map((n) => (
                  <View
                    key={n}
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text>{n}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* CONFIRM BUTTON */}
            <TouchableOpacity
              style={{
                backgroundColor: "#2563EB",
                paddingVertical: 16,
                borderRadius: 16,
                marginTop: 40,
                alignItems: "center",
              }}
              onPress={() => {
                console.log("CONFIRM SERVICE:", service._id);
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
