import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";

type Service = {
  _id: string;
  name: string;
};

type User = {
  name: string;
  email: string;
  role: "client" | "prestataire";
};

export default function HomeScreen() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🔐 Load services + user
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const storedUser = await AsyncStorage.getItem("user");
          if (storedUser) setUser(JSON.parse(storedUser));
        }

        const res = await api.get("/services");
        setServices(res.data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 🔁 Refresh user when screen focused
  useFocusEffect(
    useCallback(() => {
      const refreshUser = async () => {
        const storedUser = await AsyncStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      };
      refreshUser();
    }, [])
  );

  // ✨ Fade animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const bg = dark ? "#020617" : "#F6F7FB";
  const card = dark ? "#020617" : "#FFFFFF";
  const text = dark ? "#F9FAFB" : "#111827";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* TOP BAR */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: text }}>
            Service Home
          </Text>

          {/* 🌙 Dark Mode */}
          <TouchableOpacity onPress={() => setDark(!dark)}>
            <Text style={{ fontSize: 20 }}>
              {dark ? "☀️" : "🌙"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* HEADER */}
          <Text style={{ fontSize: 28, fontWeight: "800", color: text }}>
            Best Helping
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "800", color: text }}>
            Hand for You
          </Text>

          {/* USER CARD / LOGIN */}
          {user ? (
            <View
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 16,
                backgroundColor: "#111827",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {/* Avatar */}
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: "#2563EB",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                  Welcome
                </Text>
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {user.name}
                </Text>

                <Text style={{ color: "#60A5FA", fontSize: 11 }}>
                  Role: {user.role}
                </Text>
              </View>

              {/* Logout */}
              <TouchableOpacity
                onPress={async () => {
                  await AsyncStorage.clear();
                  setUser(null);
                }}
              >
                <Text style={{ color: "#F87171" }}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile")}
              style={{
                backgroundColor: "#111827",
                padding: 14,
                borderRadius: 16,
                marginTop: 20,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Login / Register
              </Text>
            </TouchableOpacity>
          )}
            
          {/* SERVICES */}
          {/* SERVICES (CLIENT ONLY) */}
{user?.role === "client" && (
  <>
    <Text
      style={{
        marginTop: 30,
        marginBottom: 14,
        fontSize: 18,
        fontWeight: "700",
        color: text,
      }}
    >
      Categories
    </Text>

    {loading ? (
      <ActivityIndicator />
    ) : (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {services.map((item) => (
          <TouchableOpacity
            key={item._id}
            onPress={() => {
              // user راه client هنا، ما خاصش check أخرى
              router.push({
                pathname: "/(tabs)/service",
                params: { serviceId: item._id },
              });
            }}
            style={{
              width: "30%",
              backgroundColor: card,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 24 }}>🛠️</Text>
            <Text style={{ color: text, marginTop: 6, fontSize: 12 }}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </>
)}

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
