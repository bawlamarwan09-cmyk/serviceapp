import { Dimensions, Image, View } from "react-native";

const { width } = Dimensions.get("window");

export default function HeroCard() {
  return (
    <View
      style={{
        height: width * 1.15,
        borderRadius: 30,
        overflow: "hidden",
        marginTop: 20,
      }}
    >
      {/* IMAGE BACKGROUND */}
      <Image
        source={require("../assets/images/hero.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          resizeMode: "cover",
        }}
      />

      {/* LIGHT OVERLAY */}
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255,255,255,0.25)",
        }}
      />
    </View>
  );
}
