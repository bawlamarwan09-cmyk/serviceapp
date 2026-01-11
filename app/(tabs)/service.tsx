import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";

/* 🔹 TYPES (مهم) */
type Prestataire = {
  _id: string;
  user?: {
    name: string;
  };
  experience?: number;
  city?: string;
  availability?: boolean;
};

export default function ServiceScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();

  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!serviceId) return;

    const loadPrestataires = async () => {
      try {
        const res = await api.get(
          `/prestataires?service=${serviceId}`
        );
        setPrestataires(res.data);
      } catch (err) {
        console.log("Error loading prestataires", err);
      } finally {
        setLoading(false);
      }
    };

    loadPrestataires();
  }, [serviceId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "800",
            marginBottom: 20,
            color: "#111827",
          }}
        >
          Prestataires
        </Text>

        {loading ? (
          <ActivityIndicator />
        ) : prestataires.length === 0 ? (
          <Text style={{ color: "#6B7280" }}>
            No prestataires for this service
          </Text>
        ) : (
          prestataires.map((p) => (
            <View
              key={p._id} // ✅ ما غاديش يطلع بالحمّر
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 16,
                marginBottom: 14,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 16,
                  color: "#111827",
                }}
              >
                {p.user?.name || "Prestataire"}
              </Text>

              {p.experience !== undefined && (
                <Text style={{ color: "#6B7280", marginTop: 4 }}>
                  Experience: {p.experience} years
                </Text>
              )}

              {p.city && (
                <Text style={{ color: "#6B7280", marginTop: 2 }}>
                  City: {p.city}
                </Text>
              )}

              {p.availability !== undefined && (
                <Text
                  style={{
                    marginTop: 6,
                    color: p.availability ? "#16A34A" : "#DC2626",
                    fontWeight: "600",
                  }}
                >
                  {p.availability ? "Available" : "Unavailable"}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
