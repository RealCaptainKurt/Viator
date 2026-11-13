import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Sidebar from '../../components/layout/Sidebar';
import TabBar from '../../components/layout/TabBar';
import NodeModalHost from '../../components/nodes/NodeModals';

/** The five main pages, switched with the bottom tab bar. */
export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
          // Slide + fade between tabs, in the direction of travel.
          animation: 'shift',
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="character" />
        <Tabs.Screen name="dice" />
        <Tabs.Screen name="campaign" />
        <Tabs.Screen name="oracle" />
      </Tabs>
      <Sidebar />
      <NodeModalHost />
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
