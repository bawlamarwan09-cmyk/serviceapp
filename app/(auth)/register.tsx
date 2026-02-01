import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";

/* ================= TYPES ================= */
type Category = {
  _id: string;
  name: string;
};

type Service = {
  _id: string;
  name: string;
};

/* ================= CLOUDINARY UPLOAD ================= */
const uploadToCloudinary = async (
  uri: string,
  userId: string,
  type: "profile" | "certificate"
) => {
  const data = new FormData();

  data.append("file", {
    uri,
    type: "image/jpeg",
    name: `${type}.jpg`,
  } as any);

  data.append("upload_preset", "mobile_upload");
  data.append("folder", `users/${userId}`);
  data.append("public_id", type);

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dzkunkxwu/image/upload",
    {
      method: "POST",
      body: data,
    }
  );

  const json = await res.json();
  return {
    url: json.secure_url,
    publicId: json.public_id,
  };
};

/* ================= SCREEN ================= */
export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "prestataire">("client");

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [experience, setExperience] = useState("");
  const [city, setCity] = useState("");

  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [certificateUri, setCertificateUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    // ✅ Use correct endpoint
    api.get("/catalog/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  /* ================= SELECT CATEGORY ================= */
  const onSelectCategory = async (id: string) => {
    setCategoryId(id);
    setServiceId("");
    setServices([]);

    try {
      // ✅ Use correct endpoint with category filter
      const res = await api.get(`/catalog/services?category=${id}`);
      setServices(res.data);
    } catch (err) {
      console.error("Failed to load services:", err);
      Alert.alert("Error", "Could not load services");
    }
  };

  /* ================= IMAGE PICKER ================= */
  const pickImage = async (setUri: any) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });

    if (!result.canceled) {
      setUri(result.assets[0].uri);
    }
  };

  /* ================= REGISTER HANDLER ================= */
  const handleRegister = async () => {
    try {
      setLoading(true);

      // ✅ Validation
      if (!name || !email || !password || !city) {
        Alert.alert("Error", "Please fill all required fields");
        return;
      }

      if (role === "prestataire") {
        if (!categoryId || !serviceId || !experience) {
          Alert.alert("Error", "Please fill all prestataire fields");
          return;
        }

        if (!profileUri || !certificateUri) {
          Alert.alert("Error", "Please upload profile image and certificate");
          return;
        }
      }

      // ✅ FOR CLIENT - Use regular register
      if (role === "client") {
        const payload = {
          name,
          email,
          password,
          role: "client",
          city,
        };

        console.log("📤 Registering client:", payload);

        const res = await api.post("/auth/register", payload);

        console.log("✅ Client registered:", res.data);

        // Save token and user
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

        Alert.alert("Success", "Account created successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ]);

        return;
      }

      // ✅ FOR PRESTATAIRE - Use register-prestataire endpoint
      if (role === "prestataire") {
        const payload = {
          name,
          email,
          password,
          city,
          category: categoryId,
          service: serviceId,
          experience: `${experience} years`,
        };

        console.log("📤 Registering prestataire:", payload);

        // Step 1: Register prestataire (creates user + prestataire)
        const res = await api.post("/auth/register-prestataire", payload);

        console.log("✅ Prestataire registered:", res.data);

        // Save token
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

        const userId = res.data.user.id;

        // Step 2: Upload images to Cloudinary
        console.log("📤 Uploading images...");

        const profile = await uploadToCloudinary(profileUri!, userId, "profile");
        const certificate = await uploadToCloudinary(
          certificateUri!,
          userId,
          "certificate"
        );

        console.log("✅ Images uploaded");

        // Step 3: Update prestataire with images
        // ✅ You need to add an endpoint to update prestataire images
        // OR include them in the initial registration

        // For now, you can call the prestataire update endpoint
        // await api.put(`/prestataires/${res.data.prestataire._id}`, {
        //   profileImage: profile,
        //   certificateImage: certificate,
        // });

        Alert.alert("Success", "Account created successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ]);
      }
    } catch (error: any) {
      console.error("❌ Register error:", error);
      console.error("Response:", error.response?.data);

      const errorMsg =
        error.response?.data?.msg ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";

      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F1F5F9" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Account ✨</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <Label text="Full Name *" />
          <Input value={name} onChangeText={setName} placeholder="John Doe" />

          <Label text="Email *" />
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Label text="Password *" />
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Min 6 characters"
            secureTextEntry
          />

          <Label text="City *" />
          <Input value={city} onChangeText={setCity} placeholder="Casablanca" />

          <Label text="Choose Role" />
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <RoleBtn
              title="👤 Client"
              active={role === "client"}
              onPress={() => setRole("client")}
            />
            <RoleBtn
              title="🧑‍🔧 Prestataire"
              active={role === "prestataire"}
              onPress={() => setRole("prestataire")}
            />
          </View>

          {role === "prestataire" && (
            <>
              <Label text="Category *" />
              {categories.length === 0 ? (
                <Text style={{ color: "#6B7280", marginBottom: 16 }}>
                  Loading categories...
                </Text>
              ) : (
                categories.map((c) => (
                  <SelectBtn
                    key={c._id}
                    title={c.name}
                    active={categoryId === c._id}
                    onPress={() => onSelectCategory(c._id)}
                  />
                ))
              )}

              {categoryId !== "" && (
                <>
                  <Label text="Service *" />
                  {services.length === 0 ? (
                    <Text style={{ color: "#6B7280", marginBottom: 16 }}>
                      Loading services...
                    </Text>
                  ) : (
                    services.map((s) => (
                      <SelectBtn
                        key={s._id}
                        title={s.name}
                        active={serviceId === s._id}
                        onPress={() => setServiceId(s._id)}
                      />
                    ))
                  )}
                </>
              )}

              <Label text="Experience (years) *" />
              <Input
                value={experience}
                onChangeText={setExperience}
                placeholder="e.g., 5"
                keyboardType="numeric"
              />

              <Upload
                title="Profile Image *"
                image={profileUri}
                onPress={() => pickImage(setProfileUri)}
              />

              <Upload
                title="Certificate *"
                image={certificateUri}
                onPress={() => pickImage(setCertificateUri)}
              />
            </>
          )}

          <TouchableOpacity
            onPress={handleRegister}
            style={styles.btn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Register
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/login")}
            style={{ marginTop: 16, alignItems: "center" }}
          >
            <Text style={{ color: "#6B7280" }}>
              Already have an account?{" "}
              <Text style={{ color: "#2563EB", fontWeight: "700" }}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= SMALL COMPONENTS ================= */
const Label = ({ text }: any) => (
  <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 6 }}>
    {text}
  </Text>
);

const Input = (props: any) => (
  <TextInput
    {...props}
    style={{
      backgroundColor: "#F3F4F6",
      borderRadius: 14,
      padding: 14,
      marginBottom: 16,
    }}
  />
);

const RoleBtn = ({ title, active, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flex: 1,
      marginHorizontal: 5,
      padding: 14,
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

const SelectBtn = ({ title, active, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: active ? "#2563EB" : "#E5E7EB",
      padding: 14,
      borderRadius: 14,
      marginBottom: 8,
    }}
  >
    <Text style={{ color: active ? "#fff" : "#111827", fontWeight: "700" }}>
      {title}
    </Text>
  </TouchableOpacity>
);

const Upload = ({ title, image, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.upload}>
    {image ? (
      <Image
        source={{ uri: image }}
        style={{ width: 80, height: 80, borderRadius: 8 }}
      />
    ) : (
      <Text>📤 Upload {title}</Text>
    )}
  </TouchableOpacity>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 30,
  },
  upload: {
    backgroundColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
});