import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import api from "./services/api";

type Message = {
  _id: string;
  demandId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export default function ChatRoomScreen() {
  const params = useLocalSearchParams<{
    demandId?: string | string[];
    otherUserId?: string | string[];
  }>();

  const demandId = Array.isArray(params.demandId) ? params.demandId[0] : params.demandId;
  const otherUserId = Array.isArray(params.otherUserId) ? params.otherUserId[0] : params.otherUserId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    init();
  }, [demandId]);

  const init = async () => {
    try {
      console.log("Initializing Chat Room");
      console.log("Demand ID:", demandId);

      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);
        const userId = user._id || user.id || user.userId;

        if (userId) {
          setCurrentUserId(String(userId));
          console.log("Current user ID:", userId);
        } else {
          setError("Could not get user ID");
          setLoading(false);
          return;
        }
      } else {
        setError("Please login first");
        setLoading(false);
        return;
      }

      if (!demandId) {
        setError("No conversation ID provided");
        setLoading(false);
        return;
      }

      await loadMessages();
    } catch (error: any) {
      console.error("Init error:", error);
      setError("Failed to initialize chat");
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      console.log("Loading messages for demand:", demandId);

      try {
        await api.get("/messages/conversations");
      } catch (e) {}

      const res = await api.get(`/messages/${demandId}`);
      const list = Array.isArray(res.data) ? res.data : [];

      setMessages(list.reverse());

      setError("");
    } catch (err: any) {
      console.error("Load messages error:", err.response?.data || err.message);

      if (err.response?.status === 403) {
        setError("Access denied");
      } else {
        setError("Failed to load messages");
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    if (!demandId) return alert("Missing demandId");
    if (!otherUserId) return alert("Missing otherUserId");

    try {
      const res = await api.post("/messages", {
        demandId,
        content: text.trim(),
      });

      const newMsg = res?.data;

      if (!newMsg || typeof newMsg !== "object") {
        console.log("Invalid message response:", newMsg);
        return alert("Message sent but response invalid");
      }

      setMessages((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return [newMsg, ...safePrev];
      });

      setText("");
    } catch (err: any) {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);
      console.log("MSG:", err.message);
      alert(err.response?.data?.msg || "Failed to send message");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Chat" }} />

      <SafeAreaView style={{ flex: 1, backgroundColor: "#EEF2F7" }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={styles.container}>
            {messages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet</Text>
              </View>
            ) : (
              <FlatList
                inverted
                data={messages}
                keyExtractor={(item) => item._id}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                  const isMine = item.senderId === currentUserId;
                  return (
                    <View style={[styles.message, isMine ? styles.sent : styles.received]}>
                      <Text style={[styles.messageText, !isMine && { color: "#111827" }]}>
                        {item.content}
                      </Text>
                      <Text style={[styles.time, !isMine && { color: "#6B7280" }]}>
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  );
                }}
              />
            )}

            <View style={styles.inputRow}>
              <View style={styles.inputCard}>
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder="Type a message..."
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
                  disabled={!text.trim()}
                  activeOpacity={0.85}
                >
                  <Text style={styles.sendText}>➤</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2F7",
  },

  list: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    flexGrow: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#EEF2F7",
  },

  errorText: {
    fontSize: 15,
    color: "#EF4444",
    textAlign: "center",
    lineHeight: 20,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },

  message: {
    maxWidth: "82%",
    marginBottom: 10,
  },

  sent: {
    alignSelf: "flex-end",
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderTopRightRadius: 6,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },

  received: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#FFFFFF",
  },

  time: {
    marginTop: 6,
    fontSize: 11,
    opacity: 0.85,
    alignSelf: "flex-end",
    color: "#DBEAFE",
  },

  inputRow: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 16 : 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  inputCard: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: "#111827",
    paddingVertical: 8,
    maxHeight: 120,
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  sendBtnDisabled: {
    backgroundColor: "#93C5FD",
    opacity: 0.75,
  },

  sendText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
});
