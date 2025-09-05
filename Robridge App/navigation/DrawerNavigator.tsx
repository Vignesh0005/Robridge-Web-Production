import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import BarcodeGeneratorScreen from '../screens/BarcodeGeneratorScreen';
import ImageProcessorScreen from '../screens/ImageProcessorScreen';
import RobotControlScreen from '../screens/RobotControlScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Drawer = createDrawerNavigator();

// Custom drawer content component
const CustomDrawerContent = (props: any) => {
  const { user, logout } = useAuth();
  
  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      {/* Logo and Brand Header */}
      <View style={styles.drawerHeader}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="hardware-chip" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.brandName}>Robridge</Text>
          <Text style={styles.brandTagline}>AI-Powered Robotics</Text>
        </View>
        
        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={24} color={COLORS.textLight} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userRole}>{user?.role || 'Operator'}</Text>
          </View>
        </View>
      </View>
      
      {/* Divider */}
      <View style={styles.divider} />
      
      {/* Default drawer items */}
      <DrawerItemList {...props} />
      
      {/* Logout button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'BarcodeScanner':
              iconName = focused ? 'scan' : 'scan-outline';
              break;
            case 'BarcodeGenerator':
              iconName = focused ? 'qr-code' : 'qr-code-outline';
              break;
            case 'ImageProcessor':
              iconName = focused ? 'image' : 'image-outline';
              break;
            case 'RobotControl':
              iconName = focused ? 'game-controller' : 'game-controller-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.textSecondary,
        drawerStyle: {
          backgroundColor: COLORS.surface,
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: SIZES.body,
          fontWeight: '500',
          marginLeft: -10,
        },
        // Remove default headers to use custom ones
        headerShown: false,
        // Enable swipe to open/close drawer
        swipeEnabled: true,
        // Enable edge swipe to open drawer
        drawerType: 'front',
        // Overlay when drawer is open
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        // Enable touch events
        gestureEnabled: true,
        // Enable touch response
        touchResponseDistance: 50,
        // Enable keyboard handling
        keyboardDismissMode: 'on-drag',
      })}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          drawerLabel: 'Dashboard'
        }}
      />
      <Drawer.Screen 
        name="BarcodeScanner" 
        component={BarcodeScannerScreen}
        options={{ 
          drawerLabel: 'Scan Barcode'
        }}
      />
      <Drawer.Screen 
        name="BarcodeGenerator" 
        component={BarcodeGeneratorScreen}
        options={{ 
          drawerLabel: 'Generate Barcode'
        }}
      />
      <Drawer.Screen 
        name="ImageProcessor" 
        component={ImageProcessorScreen}
        options={{ 
          drawerLabel: 'Image Processor'
        }}
      />
      <Drawer.Screen 
        name="RobotControl" 
        component={RobotControlScreen}
        options={{ 
          drawerLabel: 'Robot Control'
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          drawerLabel: 'Settings'
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin / 2,
  },
  brandName: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SIZES.margin / 4,
  },
  brandTagline: {
    fontSize: SIZES.fontSmall,
    color: COLORS.secondaryLight,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 2,
  },
  userRole: {
    fontSize: SIZES.fontSmall,
    color: COLORS.secondaryLight,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayLight,
    marginVertical: SIZES.margin,
  },
  logoutSection: {
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding / 2,
  },
  logoutText: {
    fontSize: SIZES.body,
    color: COLORS.error,
    marginLeft: SIZES.margin / 2,
    fontWeight: '500',
  },
});

export default DrawerNavigator;
