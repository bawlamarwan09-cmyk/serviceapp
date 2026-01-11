import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#8d5a18ff" }}>
      {/* CENTER CONTENT */}
     <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >

        {/* LOGO */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <Image
            source={require("../assets/images/logo.png")}
            style={{
              width: 500,
              height: 400,
              resizeMode: "contain",
              marginBottom: 20,
            }}
          />
        </Animated.View>

        {/* TEXT */}
        <Animated.View
          entering={FadeInUp.delay(400)}
          style={{ alignItems: "center" }}
        >
          {/* TAG */}
          <Text
            style={{
              fontSize: 12,
              letterSpacing: 2,
              color: "#f0ece4ff",
              marginBottom: 10,
              fontWeight: "600",
            }}
          >
            TRUSTED SERVICE
          </Text>

          {/* TITLE */}
          <Text
            style={{
              fontSize: 30,
              fontWeight: "800",
              color: "#8ca6e3ff",
              lineHeight: 40,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Best Helping Hand for You
          </Text>

          {/* SUBTITLE */}
          <Text
            style={{
              fontSize: 15,
              color: "#ffffffff",
              lineHeight: 20,
              textAlign: "center",
              maxWidth: "90%",
            }}
          >
            Find trusted experts for all services you need at your home.
          </Text>
        </Animated.View>
      </View>

      {/* ARROW BUTTON */}
      <Animated.View
        entering={FadeInUp.delay(800)}
        style={{
          position: "absolute",
          bottom: 70,
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
            backgroundColor: "#ffffffff",
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
