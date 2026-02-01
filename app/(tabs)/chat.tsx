import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../services/api";

/* =======================
   TYPES
======================= */

type Message = {
  _id: string;
  from: string;
  to: string;
  content: string;
  createdAt: string;
};

/* =======================
   SCREEN
======================= */

export default function ChatScreen() {
  const { demandId, otherUserId } = useLocalSearchParams<{
    demandId: string;
    otherUserId: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!demandId) return;
    loadMessages();
    markAsRead();
  }, [demandId]);

  /* =======================
     LOAD MESSAGES
  ======================= */

  const loadMessages = async () => {
    try {
      const res = await api.get(`/messages/demand/${demandId}`);
      setMessages(res.data);
    } catch (err) {
      console.log("❌ Load messages error", err);
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     SEND MESSAGE
  ======================= */

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await api.post("/messages", {
        to: otherUserId,
        content: text,
        demandId,
      });

      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch (err) {
      console.log("❌ Send message error", err);
    }
  };

  /* =======================
     MARK AS READ
  ======================= */

  const markAsRead = async () => {
    try {
      await api.put(`/messages/demand/${demandId}/read`);
    } catch (err) {
      console.log("❌ Mark as read error", err);
    }
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.from === otherUserId
                  ? styles.received
                  : styles.sent,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.from === otherUserId && { color: "#111827" },
                ]}
              >
                {item.content}
              </Text>
            </View>
          )}
        />

        {/* INPUT */}
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            style={styles.input}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  list: {
    padding: 16,
  },
  message: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  sent: {
    backgroundColor: "#2563EB",
    alignSelf: "flex-end",
  },
  received: {
    backgroundColor: "#E5E7EB",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#FFFFFF",
  },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
