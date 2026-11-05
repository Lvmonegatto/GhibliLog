import {
  TabList,
  TabListProps,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
  Tabs,
} from "expo-router/ui";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="catalogo" href="/" asChild>
            <TabButton>Catálogo</TabButton>
          </TabTrigger>
          <TabTrigger name="favoritos" href="/favoritos" asChild>
            <TabButton>Favoritos</TabButton>
          </TabTrigger>
          <TabTrigger name="quero-assistir" href="/quero-assistir" asChild>
            <TabButton>Quero assistir</TabButton>
          </TabTrigger>
          <TabTrigger name="diario" href="/diario" asChild>
            <TabButton>Diário</TabButton>
          </TabTrigger>
          <TabTrigger name="estatisticas" href="/estatisticas" asChild>
            <TabButton>Estatísticas</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [styles.button, isFocused && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.label, isFocused && styles.selectedLabel]}>{children}</Text>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  return <View {...props} style={styles.tabList} />;
}

const styles = StyleSheet.create({
  slot: { flex: 1, height: "100%" },
  tabList: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: 760,
    marginHorizontal: 12,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#E9EDE3",
  },
  button: { minHeight: 40, justifyContent: "center", paddingHorizontal: 12, borderRadius: 14 },
  selected: { backgroundColor: "#62745B" },
  label: { color: "#536052", fontSize: 13, fontWeight: "600" },
  selectedLabel: { color: "#FFFFFF" },
  pressed: { opacity: 0.72 },
});
