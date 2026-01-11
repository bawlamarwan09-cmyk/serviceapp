import { useRouter } from "expo-router";
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

/* 🔹 TYPE */
type Category = {
  _id: string;
  name: string;
  icon?: string;
  description?: string;
};

export default function HomeScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.log("Error loading categories", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            marginBottom: 20,
            color: "#111827",
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
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat._id} // ✅ ما غاديش يطلع بالحمّر
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/services",
                    params: {
                      categoryId: cat._id, // ✅ string
                      categoryName: cat.name,
                    },
                  })
                }
                style={{
                  width: "48%",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 18,
                  paddingVertical: 24,
                  alignItems: "center",
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                }}
              >
                <Text style={{ fontSize: 28 }}>
                  {cat.icon || "🛠️"}
                </Text>

                <Text
                  style={{
                    marginTop: 10,
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
