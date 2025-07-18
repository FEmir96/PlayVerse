import { ConvexProvider } from "convex/react";
import { convex } from "./src/lib/convexClient";
import { View, Text } from "react-native";

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <View style={{ marginTop: 100, padding: 20 }}>
        <Text style={{ fontSize: 22 }}>PlayVerse Mobile conectado 🎮</Text>
      </View>
    </ConvexProvider>
  );
}
