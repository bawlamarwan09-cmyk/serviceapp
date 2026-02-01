import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
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

export default function PrestataireDashboard() {
  const router = useRouter();

  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

 const init = async () => {
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
        <View style={{ padding: 15, borderBottomWidth: 1 }}>
          <Text>👤 Client: {item.client.name}</Text>
          <Text>📞 Phone: {item.client.phone}</Text>
          <Text>🛠 Service: {item.service}</Text>
          <Text>📌 Status: {item.status}</Text>
        </View>
      )}
    />
  );
}
