import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      {/* BACKGROUND IMAGE */}
      <Image
        source={require("../assets/images/hero.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          resizeMode: "cover",
        }}
      />

      {/* TEXT (TOP LEFT – CLEAN STYLE) */}
      <Animated.View
        entering={FadeInUp.delay(100)}
        style={{
          position: "absolute",
          top: 80,
          left: 24,
          right: 24,
        }}
      >
        {/* SMALL TAG */}
        <Text
          style={{
            fontSize: 12,
            letterSpacing: 2,
            color: "#F59E0B",
            marginBottom: 8,
            fontWeight: "600",
          }}
        >
          TRUSTED SERVICE
        </Text>

        {/* TITLE */}
        <Text
          style={{
            fontSize: 36,
            fontWeight: "800",
            color: "#0F172A",
            lineHeight: 42,
            maxWidth: "85%",
          }}
        >
          Best Helping{"\n"}Hand for You
        </Text>

        {/* SUBTITLE */}
        <Text
          style={{
            fontSize: 15,
            color: "#475569",
            marginTop: 12,
            lineHeight: 22,
            maxWidth: "85%",
          }}
        >
          Find trusted experts for all services you need at your home.
        </Text>
      </Animated.View>

      {/* ARROW BUTTON */}
      <Animated.View
        entering={FadeInUp.delay(4000)}
        style={{
          position: "absolute",
          bottom: 90,
          alignSelf: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.85}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#FDBA74",
            alignItems: "center",
            justifyContent: "center",
            elevation: 6,
          }}
        >
          <Text style={{ fontSize: 26 }}>↗</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
