import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootDrawerNavigationProp } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';

interface SystemHealth {
  database: { status: string; lastCheck: string };
  robot: { status: string; battery: number; position: string };
  performance: { cpu: number; memory: number; uptime: string };
}

interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
}

const DashboardScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: { status: 'Online', lastCheck: '2 min ago' },
    robot: { status: 'Connected', battery: 85, position: '(10, 20, 5)' },
    performance: { cpu: 45, memory: 62, uptime: '3d 12h 34m' },
  });
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([
    { id: '1', type: 'scan', message: 'Barcode scanned: 123456789', timestamp: '2 min ago', icon: 'scan' },
    { id: '2', type: 'robot', message: 'Robot moved to position (10, 20, 5)', timestamp: '5 min ago', icon: 'game-controller' },
    { id: '3', type: 'warning', message: 'Battery level low: 15%', timestamp: '10 min ago', icon: 'warning' },
    { id: '4', type: 'image', message: 'Image processed successfully', timestamp: '15 min ago', icon: 'image' },
  ]);

  const navigation = useNavigation<RootDrawerNavigationProp>();
  const { logout, user } = useAuth();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setSystemHealth({
        database: { status: 'Online', lastCheck: 'Just now' },
        robot: { status: 'Connected', battery: Math.floor(Math.random() * 30) + 70, position: '(10, 20, 5)' },
        performance: { cpu: Math.floor(Math.random() * 30) + 30, memory: Math.floor(Math.random() * 30) + 50, uptime: '3d 12h 34m' },
      });
      setRefreshing(false);
    }, 2000);
  }, []);

  const openDrawer = () => {
    console.log('Menu button pressed - attempting to open drawer');
    try {
      navigation.openDrawer();
      console.log('Drawer opened successfully');
    } catch (error) {
      console.error('Error opening drawer:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'scan':
        navigation.navigate('BarcodeScanner');
        break;
      case 'generate':
        navigation.navigate('BarcodeGenerator');
        break;
      case 'control':
        navigation.navigate('RobotControl');
        break;
      case 'process':
        navigation.navigate('ImageProcessor');
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'connected':
        return COLORS.success;
      case 'offline':
      case 'disconnected':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      default:
        return COLORS.gray;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={openDrawer}
          activeOpacity={0.5}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={28} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Robridge Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back, {user?.name || 'User'}!</Text>
          <Text style={styles.welcomeSubtext}>Here's what's happening with your robots</Text>
        </View>

        {/* System Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthGrid}>
            <View style={styles.healthCard}>
              <Ionicons name="server" size={24} color={COLORS.primary} />
              <Text style={styles.healthLabel}>Database</Text>
              <Text style={[styles.healthValue, { color: getStatusColor(systemHealth.database.status) }]}>
                {systemHealth.database.status}
              </Text>
              <Text style={styles.healthDetail}>{systemHealth.database.lastCheck}</Text>
            </View>
            <View style={styles.healthCard}>
              <Ionicons name="hardware-chip" size={24} color={COLORS.primary} />
              <Text style={styles.healthLabel}>Robot</Text>
              <Text style={[styles.healthValue, { color: getStatusColor(systemHealth.robot.status) }]}>
                {systemHealth.robot.status}
              </Text>
              <Text style={styles.healthDetail}>{systemHealth.robot.battery}% battery</Text>
            </View>
            <View style={styles.healthCard}>
              <Ionicons name="speedometer" size={24} color={COLORS.primary} />
              <Text style={styles.healthLabel}>Performance</Text>
              <Text style={styles.healthValue}>{systemHealth.performance.cpu}% CPU</Text>
              <Text style={styles.healthDetail}>{systemHealth.performance.memory}% memory</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.7}
              onPress={() => handleQuickAction('scan')}
            >
              <Ionicons name="scan" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Scan Barcode</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.7}
              onPress={() => handleQuickAction('generate')}
            >
              <Ionicons name="qr-code" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Generate Code</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.7}
              onPress={() => handleQuickAction('control')}
            >
              <Ionicons name="game-controller" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Robot Control</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.7}
              onPress={() => handleQuickAction('process')}
            >
              <Ionicons name="image" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Process Image</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <Ionicons 
                  name={activity.icon as any} 
                  size={20} 
                  color={activity.type === 'warning' ? COLORS.warning : COLORS.primary} 
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.message}</Text>
                  <Text style={styles.activityTime}>{activity.timestamp}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    flex: 1,
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textLight,
    textAlign: 'center',
    marginLeft: -40,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    margin: SIZES.margin,
    borderRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  welcomeText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
  },
  welcomeSubtext: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  section: {
    margin: SIZES.margin,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
  },
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  healthValue: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  healthDetail: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.marginSmall,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: SIZES.caption,
    color: COLORS.text,
    marginTop: SIZES.marginSmall,
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.paddingSmall,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  activityContent: {
    flex: 1,
    marginLeft: SIZES.marginSmall,
  },
  activityText: {
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  activityTime: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default DashboardScreen;
