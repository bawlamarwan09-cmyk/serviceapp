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

/* ================= SCREEN ================= */
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

  data.append("upload_preset", "mobile_upload"); // 👈 هادي هي الصح
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


export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "prestataire">("client");

  // prestataire fields
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [experience, setExperience] = useState("");
  const [city, setCity] = useState("");
  // URI من الهاتف
const [profileUri, setProfileUri] = useState<string | null>(null);
const [certificateUri, setCertificateUri] = useState<string | null>(null);

// Image uploaded (url + publicId)
const [profileImage, setProfileImage] = useState<any>(null);
const [certificateImage, setCertificateImage] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  /* ================= LOAD CATEGORIES ================= */

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  /* ================= SELECT CATEGORY ================= */

  const onSelectCategory = async (id: string) => {
    setCategoryId(id);
    setServiceId("");
    setServices([]);
    
    const res = await api.get(`/services?category=${id}`);
    setServices(res.data);
  };

  /* ================= IMAGE PICKER (BASE64) ================= */

 const pickImage = async (setUri: any) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.6,
  });

  if (!result.canceled) {
    setUri(result.assets[0].uri);
  }
};


  /* ================= REGISTER ================= */

 const handleRegister = async () => {
  try {
    setLoading(true);

    // 1️⃣ create user
    const payload: any = {
      name,
      email,
      password,
      role,
      city,
    };

    if (role === "prestataire") {
      payload.experience = experience;
      payload.service = serviceId;
      payload.category = categoryId;
    }

    const res = await api.post("/auth/register", payload);
    const userId = res.data.user._id;

    // 2️⃣ upload images
    const profile = await uploadToCloudinary(profileUri!, userId, "profile");
    const certificate = await uploadToCloudinary(
      certificateUri!,
      userId,
      "certificate"
    );

    // 3️⃣ update user images
    await api.put(`/users/${userId}/images`, {
      profileImage: profile,
      certificateImage: certificate,
    });

    if (role === "prestataire") {
    
      await api.post(
        "/prestataires",
        {
          service: serviceId,
          category: categoryId,
          experience,
          city,
          profileImage: profile,
          certificateImage: certificate,
        },
        {
          headers: {
            Authorization: `Bearer ${res.data.token}`, // أو token مخزّن
          },
        }
      );
    }

    Alert.alert("Success", "Account created");
  } catch (e) {
    console.log(e);
    Alert.alert("Error", "Register failed");
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

          <Label text="Full Name" />
          <Input value={name} onChangeText={setName} />

          <Label text="Email" />
          <Input value={email} onChangeText={setEmail} />

          <Label text="Password" />
          <Input value={password} onChangeText={setPassword} secureTextEntry />

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
              <Label text="Category" />
              {categories.map((c) => (
                <SelectBtn
                  key={c._id}
                  title={c.name}
                  active={categoryId === c._id}
                  onPress={() => onSelectCategory(c._id)}
                />
              ))}

              {categoryId !== "" && (
                <>
                  <Label text="Service" />
                  {services.map((s) => (
                    <SelectBtn
                      key={s._id}
                      title={s.name}
                      active={serviceId === s._id}
                      onPress={() => setServiceId(s._id)}
                    />
                  ))}
                </>
              )}

              <Label text="Experience (years)" />
              <Input value={experience} onChangeText={setExperience} />

              <Label text="City" />
              <Input value={city} onChangeText={setCity} />

              <Upload
              title="Profile Image"
              image={profileUri}
              onPress={() => pickImage(setProfileUri)}
            />

            <Upload
              title="Certificate"
              image={certificateUri}
              onPress={() => pickImage(setCertificateUri)}
            />

            </>
          )}

          <TouchableOpacity onPress={handleRegister} style={styles.btn}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Register
              </Text>
            )}
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
      <Image source={{ uri: image }} style={{ width: 80, height: 80 }} />
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

  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: "#111827",
  },

  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
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
