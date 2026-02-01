import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    Text
} from "react-native";
import api from "../../services/api";

type Demande = {
  _id: string;
  service: string;
  status: string;
  client: {
    name: string;
    phone: string;
  };
};

export default function DemandsPage() {
  const router = useRouter();

  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemands();
  }, []);

  const loadDemands = async () => {
    const storedUser = await AsyncStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== "prestataire") {
      router.replace("/login");
      return;
    }

    const res = await api.get("/demands/me");


    setDemandes(res.data);
    setLoading(false);
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <FlatList
      data={demandes}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.push(`./prestataire/demand-details?id=${item._id}`)
          }
          style={{
            padding: 15,
            borderBottomWidth: 1,
          }}
        >
          <Text>👤 {item.client.name}</Text>
          <Text>🛠 {item.service}</Text>
          <Text>📌 {item.status}</Text>
        </Pressable>
      )}
    />
  );
}
