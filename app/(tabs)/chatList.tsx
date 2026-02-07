import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../services/api";

type Demand = {
  _id: string;
  clientId: string;
  prestataireId: string;
  serviceId: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function ConversationsScreen() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string>("");
  const [myRole, setMyRole] = useState<string>("");

  useEffect(() => {
    (async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setMyId(String(u._id || u.id || u.userId || ""));
        setMyRole(String(u.role || ""));
      }
      await loadDemands();
    })();
  }, []);

  const loadDemands = async () => {
    try {
      const res = await api.get("/demands/me");
      setDemands(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error loading demands:", error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (demand: Demand) => {
    const otherUserId =
      myRole === "prestataire" ? demand.clientId : demand.prestataireId;

    router.push({
      pathname: "/chatRoom",
      params: { demandId: demand._id, otherUserId },
    });
  };

  const renderItem = ({ item }: { item: Demand }) => {
    const preview = item.message?.trim() || "Conversation";
    const date = new Date(item.createdAt);
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const displayName =
      myRole === "prestataire" ? "Client" : "Prestataire";

    return (
      <TouchableOpacity style={styles.row} onPress={() => openChat(item)} activeOpacity={0.85}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.mid}>
          <View style={styles.topLine}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.time}>{time}</Text>
          </View>

          <View style={styles.bottomLine}>
            <Text style={styles.lastMsg} numberOfLines={1}>
              {preview}
            </Text>

            
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>

      {demands.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No conversations yet</Text>
        </View>
      ) : (
        <FlatList
          data={demands}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={{ paddingBottom: 14 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    fontSize: 24,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    color: "#111827",
  },

  sep: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 78, // line starts after avatar
  },

  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  mid: { flex: 1, marginLeft: 12 },

  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  name: { fontSize: 16, fontWeight: "700", color: "#111827", flex: 1, marginRight: 10 },
  time: { fontSize: 12, color: "#6B7280" },

  bottomLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  lastMsg: { fontSize: 14, color: "#6B7280", flex: 1, marginRight: 10 },

  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#6B7280" },
});
