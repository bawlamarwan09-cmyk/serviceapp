import { useRouter } from "expo-router";
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

type Category = {
  _id: string;
  name: string;
  icon?: string;
};

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get("/catalog/categories");
      setCategories(res.data);
      console.log(res.data)
    } catch (err) {
      console.log("❌ Error loading categories", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", marginBottom: 20 }}>
          Categories
        </Text>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                onPress={() =>
                  router.push({
                    pathname: "/services",
                    params: {
                      categoryId: cat._id,
                      categoryName: cat.name,
                    },
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
                <Text style={{ fontSize: 26 }}>{cat.icon || "📂"}</Text>
                <Text style={{ marginTop: 8, fontWeight: "600" }}>
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
