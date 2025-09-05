import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootDrawerNavigationProp } from '../navigation/types';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';

interface BarcodeType {
  id: string;
  name: string;
  description: string;
  maxLength: number;
  example: string;
}

const barcodeTypes: BarcodeType[] = [
  {
    id: 'ean13',
    name: 'EAN-13',
    description: 'European Article Number (13 digits)',
    maxLength: 13,
    example: '1234567890123',
  },
  {
    id: 'ean8',
    name: 'EAN-8',
    description: 'European Article Number (8 digits)',
    maxLength: 8,
    example: '12345678',
  },
  {
    id: 'upc_a',
    name: 'UPC-A',
    description: 'Universal Product Code (12 digits)',
    maxLength: 12,
    example: '123456789012',
  },
  {
    id: 'code128',
    name: 'Code 128',
    description: 'Alphanumeric barcode',
    maxLength: 50,
    example: 'ABC123',
  },
  {
    id: 'code39',
    name: 'Code 39',
    description: 'Alphanumeric barcode',
    maxLength: 50,
    example: 'ABC123',
  },
  {
    id: 'qr',
    name: 'QR Code',
    description: 'Quick Response code (text, URL, etc.)',
    maxLength: 100,
    example: 'https://example.com',
  },
];

// Generate unique ID for generated barcodes
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const BarcodeGeneratorScreen = () => {
  const [selectedType, setSelectedType] = useState<BarcodeType>(barcodeTypes[0]);
  const [inputText, setInputText] = useState('');
  const [generatedBarcodes, setGeneratedBarcodes] = useState<Array<{
    id: string;
    type: string;
    data: string;
    timestamp: string;
  }>>([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const navigation = useNavigation<RootDrawerNavigationProp>();

  const openDrawer = () => {
    console.log('Menu button pressed - attempting to open drawer');
    try {
      navigation.openDrawer();
      console.log('Drawer opened successfully');
    } catch (error) {
      console.error('Error opening drawer:', error);
    }
  };

  const generateBarcode = () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to generate a barcode');
      return;
    }

    if (inputText.length > selectedType.maxLength) {
      Alert.alert('Error', `Text is too long for ${selectedType.name}. Maximum length is ${selectedType.maxLength} characters.`);
      return;
    }

    // Validate input based on barcode type
    if (selectedType.id === 'ean13' || selectedType.id === 'ean8' || selectedType.id === 'upc_a') {
      if (!/^\d+$/.test(inputText)) {
        Alert.alert('Error', `${selectedType.name} only accepts numeric values`);
        return;
      }
    }

    const newBarcode = {
      id: generateUniqueId(),
      type: selectedType.name,
      data: inputText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setGeneratedBarcodes(prev => [newBarcode, ...prev]);
    setInputText('');

    Alert.alert(
      'Barcode Generated!',
      `${selectedType.name} barcode created successfully.\n\nData: ${inputText}`,
      [
        { text: 'Generate Another', onPress: () => {} },
        { text: 'View History', onPress: () => setShowHistory(true) },
        { text: 'OK', style: 'default' },
      ]
    );
  };

  const selectBarcodeType = (type: BarcodeType) => {
    setSelectedType(type);
    setInputText(type.example);
    setShowTypeSelector(false);
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all generated barcodes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setGeneratedBarcodes([]) },
      ]
    );
  };

  const shareBarcode = async (barcode: any) => {
    try {
      await Share.share({
        message: `Generated ${barcode.type} barcode:\nData: ${barcode.data}\nGenerated at: ${barcode.timestamp}`,
        title: 'Generated Barcode',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share barcode');
    }
  };

  const deleteBarcode = (id: string) => {
    setGeneratedBarcodes(prev => prev.filter(barcode => barcode.id !== id));
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
        <Text style={styles.headerTitle}>Barcode Generator</Text>
        <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(true)}>
          <Ionicons name="time" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Barcode Type Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Barcode Type</Text>
          <TouchableOpacity
            style={styles.typeSelector}
            onPress={() => setShowTypeSelector(true)}
            activeOpacity={0.7}
          >
            <View style={styles.typeInfo}>
              <Text style={styles.typeName}>{selectedType.name}</Text>
              <Text style={styles.typeDescription}>{selectedType.description}</Text>
            </View>
            <Ionicons name="chevron-down" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Data</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${selectedType.name} data (max ${selectedType.maxLength} chars)`}
            placeholderTextColor={COLORS.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            maxLength={selectedType.maxLength}
            multiline={selectedType.id === 'qr'}
            numberOfLines={selectedType.id === 'qr' ? 3 : 1}
          />
          <Text style={styles.charCount}>
            {inputText.length}/{selectedType.maxLength} characters
          </Text>
          
          {selectedType.example && (
            <TouchableOpacity
              style={styles.exampleButton}
              onPress={() => setInputText(selectedType.example)}
            >
              <Text style={styles.exampleText}>Use example: {selectedType.example}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Generate Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateBarcode}
            activeOpacity={0.8}
            disabled={!inputText.trim()}
          >
            <Ionicons name="qr-code" size={32} color={COLORS.textLight} />
            <Text style={styles.generateButtonText}>Generate Barcode</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="qr-code" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{generatedBarcodes.length}</Text>
              <Text style={styles.statLabel}>Generated</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={COLORS.secondary} />
              <Text style={styles.statNumber}>
                {generatedBarcodes.length > 0 ? 'Today' : 'None'}
              </Text>
              <Text style={styles.statLabel}>Last Generated</Text>
            </View>
          </View>
        </View>

        {/* Recent Generations */}
        {generatedBarcodes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Generations</Text>
              <TouchableOpacity onPress={() => setShowHistory(true)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {generatedBarcodes.slice(0, 3).map((barcode) => (
              <View key={barcode.id} style={styles.recentItem}>
                <View style={styles.recentInfo}>
                  <Ionicons name="qr-code" size={24} color={COLORS.primary} />
                  <View style={styles.recentDetails}>
                    <Text style={styles.recentType}>{barcode.type}</Text>
                    <Text style={styles.recentData}>{barcode.data}</Text>
                    <Text style={styles.recentTime}>{barcode.timestamp}</Text>
                  </View>
                </View>
                <View style={styles.recentActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => shareBarcode(barcode)}
                  >
                    <Ionicons name="share" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteBarcode(barcode.id)}
                  >
                    <Ionicons name="trash" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Barcode Type Selector Modal */}
      <Modal
        visible={showTypeSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Barcode Type</Text>
            <TouchableOpacity onPress={() => setShowTypeSelector(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {barcodeTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeOption,
                  selectedType.id === type.id && styles.typeOptionSelected
                ]}
                onPress={() => selectBarcodeType(type)}
              >
                <View style={styles.typeOptionContent}>
                  <Text style={styles.typeOptionName}>{type.name}</Text>
                  <Text style={styles.typeOptionDescription}>{type.description}</Text>
                  <Text style={styles.typeOptionExample}>Example: {type.example}</Text>
                </View>
                {selectedType.id === type.id && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Generation History</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={clearHistory}>
                <Ionicons name="trash" size={24} color={COLORS.error} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {generatedBarcodes.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="qr-code" size={64} color={COLORS.gray} />
                <Text style={styles.emptyText}>No barcodes generated yet</Text>
                <Text style={styles.emptySubtext}>Start generating barcodes to see them here</Text>
              </View>
            ) : (
              generatedBarcodes.map((barcode) => (
                <View key={barcode.id} style={styles.historyItem}>
                  <View style={styles.historyInfo}>
                    <Ionicons name="qr-code" size={24} color={COLORS.primary} />
                    <View style={styles.historyDetails}>
                      <Text style={styles.historyType}>{barcode.type}</Text>
                      <Text style={styles.historyData}>{barcode.data}</Text>
                      <Text style={styles.historyTime}>{barcode.timestamp}</Text>
                    </View>
                  </View>
                  <View style={styles.historyActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => shareBarcode(barcode)}
                    >
                      <Ionicons name="share" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => deleteBarcode(barcode.id)}
                    >
                      <Ionicons name="trash" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
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
  historyButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  section: {
    marginBottom: SIZES.marginLarge,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  viewAllText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  typeSelector: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  typeDescription: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.body,
    color: COLORS.text,
    minHeight: 50,
  },
  charCount: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SIZES.marginSmall,
  },
  exampleButton: {
    marginTop: SIZES.marginSmall,
  },
  exampleText: {
    fontSize: SIZES.caption,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  generateButtonText: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginLeft: SIZES.marginSmall,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.marginSmall,
  },
  statLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  recentItem: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.marginSmall,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentDetails: {
    marginLeft: SIZES.marginSmall,
    flex: 1,
  },
  recentType: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  recentData: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recentTime: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recentActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SIZES.marginSmall,
    marginLeft: SIZES.marginSmall,
  },
  deleteButton: {
    backgroundColor: COLORS.error + '20',
    borderRadius: SIZES.radiusSmall,
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
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    padding: SIZES.padding,
  },
  typeOption: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeOptionSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  typeOptionContent: {
    flex: 1,
  },
  typeOptionName: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  typeOptionDescription: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  typeOptionExample: {
    fontSize: SIZES.caption,
    color: COLORS.primary,
    marginTop: 4,
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
  historyItem: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyDetails: {
    marginLeft: SIZES.marginSmall,
    flex: 1,
  },
  historyType: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  historyData: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  historyTime: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  historyActions: {
    flexDirection: 'row',
  },
});

export default BarcodeGeneratorScreen;
