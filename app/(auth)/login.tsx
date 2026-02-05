import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";


export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Error", "All fields are required");
    return;
  }

  try {
    setLoading(true);

    const res = await api.post("/auth/login", { email, password });

    const token = res.data.token || res.data.accessToken;
   const user = res.data.user;
    if (!token) {
  throw new Error("Token missing from response");
}


    if (!user?.role) {
      throw new Error("Role missing from backend");
    }

    await AsyncStorage.multiSet([
      ["token", token],
      ["user", JSON.stringify(user)],
    ]);

    // 🔁 ROLE-BASED REDIRECT
    if (user.role === "prestataire") {
      router.replace("/prestataires/demandslist"); // ✅ FIXED
    } else {
      router.replace("/(tabs)");
    }

  } catch (err: any) {
    Alert.alert(
      "Login failed",
      err?.response?.data?.msg || "Invalid credentials"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        paddingHorizontal: 20,
      }}
    >
      {/* CARD */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          padding: 24,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        }}
      >
        {/* TITLE */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            textAlign: "center",
            color: "#111827",
          }}
        >
          Welcome Back 👋
        </Text>

        <Text
          style={{
            textAlign: "center",
            color: "#6B7280",
            marginTop: 6,
            marginBottom: 30,
          }}
        >
          Login to your account
        </Text>

        {/* EMAIL */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#374151",
            marginBottom: 8,
          }}
        >
          Email
        </Text>

        <TextInput
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            backgroundColor: "#F3F4F6",
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 16,
            marginBottom: 18,
            color: "#111827",
          }}
        />

        {/* PASSWORD */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#374151",
            marginBottom: 8,
          }}
        >
          Password
        </Text>

        <TextInput
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{
            backgroundColor: "#F3F4F6",
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 16,
            marginBottom: 28,
            color: "#111827",
          }}
        />

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
          style={{
            backgroundColor: loading ? "#93C5FD" : "#2563EB",
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Login
            </Text>
          )}
        </TouchableOpacity>

        {/* REGISTER */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          style={{ marginTop: 24 }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "#6B7280",
            }}
          >
            Don't have an account?{" "}
            <Text style={{ color: "#2563EB", fontWeight: "700" }}>
              Register
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}