import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { RootDrawerNavigationProp } from '../navigation/types';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';

interface ScanResult {
  id: string;
  barcode: string;
  type: string;
  timestamp: string;
  product?: string;
}

const { width, height } = Dimensions.get('window');

// Generate unique ID for scan results
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const BarcodeScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [flashMode, setFlashMode] = useState<'off' | 'torch'>('off');
  
  const cameraRef = useRef<any>(null);
  const navigation = useNavigation<RootDrawerNavigationProp>();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Camera permission error:', error);
        setHasPermission(false);
      }
    })();
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

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const handleBarCodeScanned = (scanResult: any) => {
    if (!isScanning) return;
    
    const { data, type } = scanResult;
    
    const newResult: ScanResult = {
      id: generateUniqueId(),
      barcode: data,
      type: type || 'Unknown',
      timestamp: new Date().toLocaleTimeString(),
      product: `Product ${data.slice(-4)}`,
    };
    
    setScanResults(prev => [newResult, ...prev]);
    setIsScanning(false);
    
    Alert.alert(
      'Scan Complete!',
      `Barcode: ${data}\nType: ${type}\nProduct: ${newResult.product}`,
      [
        { text: 'Scan Again', onPress: startScanning },
        { text: 'View Results', onPress: () => setShowResults(true) },
        { text: 'OK', style: 'default' },
      ]
    );
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'torch' : 'off');
  };

  const clearResults = () => {
    Alert.alert(
      'Clear Results',
      'Are you sure you want to clear all scan results?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setScanResults([]) },
      ]
    );
  };

  const viewResultDetails = (result: ScanResult) => {
    setSelectedResult(result);
  };

  const closeResultModal = () => {
    setSelectedResult(null);
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openDrawer}
            activeOpacity={0.5}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu" size={28} color={COLORS.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Barcode Scanner</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.content}>
          <View style={styles.loadingContainer}>
            <Ionicons name="camera" size={64} color={COLORS.gray} />
            <Text style={styles.loadingText}>Requesting camera permission...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openDrawer}
            activeOpacity={0.5}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu" size={28} color={COLORS.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Barcode Scanner</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.content}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera" size={80} color={COLORS.error} />
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              This app needs camera access to scan barcodes. Please grant camera permission in your device settings.
            </Text>
            <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
              <Text style={styles.settingsButtonText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Barcode Scanner</Text>
        <TouchableOpacity style={styles.resultsButton} onPress={() => setShowResults(true)}>
          <Ionicons name="list" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Camera View */}
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
            }}
          >
            {/* Camera Overlay */}
            <View style={styles.cameraOverlay}>
              {/* Scan Frame */}
              <View style={styles.scanFrame}>
                <View style={styles.corner} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>
              
              {/* Instructions */}
              <View style={styles.instructions}>
                <Text style={styles.instructionText}>
                  Position barcode within the frame
                </Text>
              </View>
            </View>
          </CameraView>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
            onPress={isScanning ? stopScanning : startScanning}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isScanning ? "stop" : "scan"} 
              size={32} 
              color={COLORS.textLight} 
            />
            <Text style={styles.scanButtonText}>
              {isScanning ? 'Stop Scan' : 'Start Scan'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryControls}>
            <TouchableOpacity style={styles.secondaryButton} onPress={toggleFlash}>
              <Ionicons 
                name={flashMode === 'torch' ? "flash" : "flash-off"} 
                size={20} 
                color={flashMode === 'torch' ? COLORS.warning : COLORS.primary} 
              />
              <Text style={[styles.secondaryButtonText, { color: flashMode === 'torch' ? COLORS.warning : COLORS.primary }]}>
                {flashMode === 'torch' ? 'Flash On' : 'Flash Off'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowResults(true)}>
              <Ionicons name="list" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Results ({scanResults.length})</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={clearResults}>
              <Ionicons name="trash" size={20} color={COLORS.error} />
              <Text style={[styles.secondaryButtonText, { color: COLORS.error }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Scans */}
        {scanResults.length > 0 && (
          <View style={styles.recentScans}>
            <Text style={styles.recentTitle}>Recent Scans</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {scanResults.slice(0, 5).map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.recentItem}
                  onPress={() => viewResultDetails(result)}
                >
                  <Ionicons name="barcode" size={24} color={COLORS.primary} />
                  <Text style={styles.recentBarcode}>{result.barcode.slice(-6)}</Text>
                  <Text style={styles.recentTime}>{result.timestamp}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Results Modal */}
      <Modal
        visible={showResults}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scan Results</Text>
            <TouchableOpacity onPress={() => setShowResults(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {scanResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="scan" size={64} color={COLORS.gray} />
                <Text style={styles.emptyText}>No scans yet</Text>
                <Text style={styles.emptySubtext}>Start scanning to see results here</Text>
              </View>
            ) : (
              scanResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.resultItem}
                  onPress={() => viewResultDetails(result)}
                >
                  <View style={styles.resultHeader}>
                    <Ionicons name="barcode" size={24} color={COLORS.primary} />
                    <Text style={styles.resultBarcode}>{result.barcode}</Text>
                    <Text style={styles.resultType}>{result.type}</Text>
                  </View>
                  {result.product && (
                    <Text style={styles.resultProduct}>{result.product}</Text>
                  )}
                  <Text style={styles.resultTime}>{result.timestamp}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Result Details Modal */}
      <Modal
        visible={!!selectedResult}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.detailModalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Scan Details</Text>
              <TouchableOpacity onPress={closeResultModal}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            {selectedResult && (
              <View style={styles.detailContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Barcode:</Text>
                  <Text style={styles.detailValue}>{selectedResult.barcode}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>{selectedResult.type}</Text>
                </View>
                {selectedResult.product && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Product:</Text>
                    <Text style={styles.detailValue}>{selectedResult.product}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>{selectedResult.timestamp}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  resultsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginBottom: SIZES.margin,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width * 0.6,
    height: width * 0.6,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: COLORS.primary,
  },
  cornerTopRight: {
    right: 0,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructions: {
    position: 'absolute',
    bottom: -60,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.marginSmall,
    borderRadius: SIZES.radius,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.h4,
    color: COLORS.text,
    marginTop: SIZES.margin,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  permissionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.margin,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin,
    textAlign: 'center',
    lineHeight: 24,
  },
  settingsButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.marginLarge,
  },
  settingsButtonText: {
    color: COLORS.textLight,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  controls: {
    marginTop: SIZES.marginLarge,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
  },
  scanButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  scanButtonText: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginLeft: SIZES.marginSmall,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  secondaryButtonText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    marginLeft: SIZES.marginSmall,
  },
  recentScans: {
    marginTop: SIZES.marginLarge,
  },
  recentTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  recentItem: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginRight: SIZES.margin,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentBarcode: {
    fontSize: SIZES.caption,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.marginSmall,
  },
  recentTime: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalContent: {
    flex: 1,
    padding: SIZES.padding,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.marginLarge * 2,
  },
  emptyText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.margin,
  },
  emptySubtext: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.marginSmall,
    textAlign: 'center',
  },
  resultItem: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginSmall,
  },
  resultBarcode: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginLeft: SIZES.marginSmall,
  },
  resultType: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.grayLight,
    paddingHorizontal: SIZES.marginSmall,
    paddingVertical: 2,
    borderRadius: SIZES.radiusSmall,
  },
  resultProduct: {
    fontSize: SIZES.body,
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
  },
  resultTime: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    width: '90%',
    maxWidth: 400,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  detailTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  detailContent: {
    marginTop: SIZES.margin,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.marginSmall,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  detailLabel: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  detailValue: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'right',
    marginLeft: SIZES.margin,
  },
});

export default BarcodeScannerScreen;
