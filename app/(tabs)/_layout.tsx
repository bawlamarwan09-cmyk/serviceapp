import { Link, Slot, usePathname } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
      {/* SCREENS */}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {/* FOOTER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingVertical: 14,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        {/* HOME */}
        <Link href="/(tabs)" asChild>
          <TouchableOpacity>
            <Text
              style={{
                fontSize: 22,
                color: isActive("/(tabs)") ? "#2563EB" : "#9CA3AF",
              }}
            >
              🏠
            </Text>
          </TouchableOpacity>
        </Link>

        {/* CATEGORIES / SERVICES */}
        <Link href="/demandslist" asChild>
          <TouchableOpacity>
            <Text
              style={{
                fontSize: 22,
                color: isActive("/(tabs)/demandslist")
                  ? "#2563EB"
                  : "#9CA3AF",
              }}
            >
              📦
            </Text>
          </TouchableOpacity>
        </Link>

        {/* CENTER ACTION */}
        <TouchableOpacity
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#2563EB",
            justifyContent: "center",
            alignItems: "center",
            marginTop: -30,
          }}
        >
          <Text style={{ fontSize: 26, color: "#fff" }}>＋</Text>
        </TouchableOpacity>

        {/* DEMANDS (NOT CHAT) */}
        <Link href="/(tabs)/services" asChild>
          <TouchableOpacity>
            <Text
              style={{
                fontSize: 22,
                color: isActive("/(tabs)/demands")
                  ? "#2563EB"
                  : "#9CA3AF",
              }}
            >
              📄
            </Text>
          </TouchableOpacity>
        </Link>

        {/* PROFILE */}
        <Link href="/(tabs)/profile" asChild>
          <TouchableOpacity>
            <Text
              style={{
                fontSize: 22,
                color: isActive("/(tabs)/profile")
                  ? "#2563EB"
                  : "#9CA3AF",
              }}
            >
              👤
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
