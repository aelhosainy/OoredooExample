import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MyFatoorahGooglePayImplementation from './src/OoredooCode';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>MyFatoorah Google Pay</Text>
          <Text style={styles.subtitle}>
            Ooredoo manual-execution test screen
          </Text>
        </View>

        {Platform.OS === 'android' ? (
          <View style={styles.content}>
            <MyFatoorahGooglePayImplementation />
          </View>
        ) : (
          <View style={styles.unsupportedContainer}>
            <Text style={styles.unsupportedTitle}>Android required</Text>
            <Text style={styles.unsupportedText}>
              This example exercises the Android Google Pay implementation.
            </Text>
          </View>
        )}</SafeAreaView>
    </SafeAreaProvider>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D9D9D9',
  },
  title: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#666666',
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  unsupportedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  unsupportedTitle: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  unsupportedText: {
    color: '#666666',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});


export default App;
