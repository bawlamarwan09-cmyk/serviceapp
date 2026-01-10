import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "prestataire">("client");

  // prestataire fields
  const [service, setService] = useState("");
  const [experience, setExperience] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [certificateImage, setCertificateImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const pickImage = async (setImage: any) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow access to gallery");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (
      role === "prestataire" &&
      (!service || !experience || !profileImage || !certificateImage)
    ) {
      Alert.alert("Error", "Complete prestataire information");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
        service,
        experience,
        profileImage,
        certificateImage,
      });

      Alert.alert("Success", "Account created successfully");
      router.replace("/(auth)/login");
    } catch (err: any) {
      Alert.alert(
        "Register failed",
        err?.response?.data?.msg || "Something went wrong"
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
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            textAlign: "center",
            color: "#111827",
          }}
        >
          Create Account ✨
        </Text>

        <Text
          style={{
            textAlign: "center",
            color: "#6B7280",
            marginTop: 6,
            marginBottom: 30,
          }}
        >
          Sign up to get started
        </Text>

        {/* NAME */}
        <Text  style={{
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  }}>Full Name</Text>
        <TextInput
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          style={input}
        />

        {/* EMAIL */}
        <Text  style={{
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  }}>Email</Text>
        <TextInput
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={input}
        />

        {/* PASSWORD */}
        <Text  style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 6,
    }}>Password</Text>
        <TextInput
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={input}
        />

        {/* ROLE */}
        <Text style={{
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  }}>Choose Role</Text>
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          <RoleBtn title="👤 Client" active={role === "client"} onPress={() => setRole("client")} />
          <RoleBtn title="🧑‍🔧 Prestataire" active={role === "prestataire"} onPress={() => setRole("prestataire")} />
        </View>

        {/* PRESTATAIRE EXTRA */}
        {role === "prestataire" && (
          <>
            <Text  style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#374151",
                marginBottom: 6,
            }}>Service</Text>
             <TextInput
              placeholder="Plumber, Electrician..."
              value={service}
              onChangeText={setService}
              style={input}
            />

            <Text  style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#374151",
            marginBottom: 6,
        }}>Experience (years)</Text>
            <TextInput
              placeholder="e.g 5"
              value={experience}
              onChangeText={setExperience}
              keyboardType="numeric"
              style={input}
            />

            <Upload
              title="Profile Image"
              image={profileImage}
              onPress={() => pickImage(setProfileImage)}
            />

            <Upload
              title="Certificate"
              image={certificateImage}
              onPress={() => pickImage(setCertificateImage)}
            />
          </>
        )}

        {/* REGISTER */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: "#2563EB",
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700" }}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={{ marginTop: 20 }}
        >
          <Text style={{ textAlign: "center", color: "#6B7280" }}>
            Already have an account?{" "}
            <Text style={{ color: "#2563EB", fontWeight: "700" }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* 🔽 COMPONENTS & STYLES */

const label = {
  fontSize: 14,
  fontWeight: "600",
  color: "#374151",
  marginBottom: 6,
};

const input = {
  backgroundColor: "#F3F4F6",
  borderRadius: 14,
  paddingVertical: 14,
  paddingHorizontal: 16,
  marginBottom: 16,
  color: "#111827",
};

const RoleBtn = ({ title, active, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flex: 1,
      marginHorizontal: 5,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
      backgroundColor: active ? "#2563EB" : "#E5E7EB",
    }}
  >
    <Text style={{ color: active ? "#fff" : "#111827", fontWeight: "700" }}>
      {title}
    </Text>
  </TouchableOpacity>
);

const Upload = ({ title, image, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: "#E5E7EB",
      borderRadius: 14,
      padding: 16,
      alignItems: "center",
      marginBottom: 16,
    }}
  >
    {image ? (
      <Image source={{ uri: image }} style={{ width: 80, height: 80, borderRadius: 10 }} />
    ) : (
      <Text style={{ fontWeight: "600" }}>📤 Upload {title}</Text>
    )}
  </TouchableOpacity>
);
