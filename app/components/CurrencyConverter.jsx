import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Switch, Animated, Easing, TouchableOpacity, FlatList, Modal, Pressable } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

const currencyFlags = {
    USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', INR: '🇮🇳', SGD: '🇸🇬', AUD: '🇦🇺',
    CAD: '🇨🇦', JPY: '🇯🇵', CNY: '🇨🇳', ZAR: '🇿🇦', CHF: '🇨🇭', KRW: '🇰🇷',
    SEK: '🇸🇪', NZD: '🇳🇿'
};

const numberPadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '<']
];

const CurrencyConverter = () => {
    const [amount, setAmount] = useState('');
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [targetCurrency, setTargetCurrency] = useState('EUR');
    const [exchangeRates, setExchangeRates] = useState({});
    const [convertedAmount, setConvertedAmount] = useState(0);
    const [currencies, setCurrencies] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(1));
    const [showBaseModal, setShowBaseModal] = useState(false);
    const [showTargetModal, setShowTargetModal] = useState(false);

    useEffect(() => { fetchCurrencies(); }, []);
    useEffect(() => { if (baseCurrency) fetchExchangeRates(); }, [baseCurrency]);

    const fetchCurrencies = async () => {
        try {
            const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD`);
            setCurrencies(Object.keys(response.data.rates));
            setExchangeRates(response.data.rates);
        } catch (error) { console.error('Error fetching currencies:', error); }
    };

    const fetchExchangeRates = async () => {
        try {
            const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
            setExchangeRates(response.data.rates);
        } catch (error) { console.error('Error fetching exchange rates:', error); }
    };

    const convertCurrency = () => {
        const rate = exchangeRates[targetCurrency];
        const result = rate ? (parseFloat(amount) * rate).toFixed(2) : 0;
        setConvertedAmount(result);
        fadeIn();
    };

    const fadeIn = () => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.ease, useNativeDriver: true }).start();
    };

    const handleKeyPress = (key) => {
        if (key === '<') {
            setAmount((prev) => prev.slice(0, -1));
        } else {
            setAmount((prev) => prev + key);
        }
    };

    const swapCurrencies = () => {
        const temp = baseCurrency;
        setBaseCurrency(targetCurrency);
        setTargetCurrency(temp);
        convertCurrency();
    };

    const renderCurrencyItem = (item, setter, closeModal) => (
        <Pressable style={styles.modalItem} onPress={() => { setter(item); closeModal(false); }}>
            <Text style={styles.modalText}>{currencyFlags[item] || '🏳️'} {item}</Text>
        </Pressable>
    );

    return (
        <LinearGradient colors={['#e0f7fa', '#ffffff']} style={{ flex: 1 }}>
            <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
                <View style={styles.switchContainer}>
                    <Text style={[styles.switchLabel, { color: isDarkMode ? '#ffffff' : '#253d8e' }]}>Dark Mode</Text>
                    <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
                </View>

                <Text style={[styles.title, { color: isDarkMode ? '#ffffff' : '#253d8e' }]}>Currency Converter</Text>

                <View style={styles.card}>
                    <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Amount</Text>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.dropdown} onPress={() => setShowBaseModal(true)}>
                            <Text style={styles.dropdownText}>{currencyFlags[baseCurrency] || '🏳️'} {baseCurrency}</Text>
                        </TouchableOpacity>
                        <Text style={styles.input}>{amount}</Text>
                    </View>

                    <TouchableOpacity onPress={swapCurrencies} style={styles.swapButton}>
                        <Icon name="exchange" size={28} color="#666" />
                    </TouchableOpacity>

                    <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#000' }]}>Converted Amount</Text>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.dropdown} onPress={() => setShowTargetModal(true)}>
                            <Text style={styles.dropdownText}>{currencyFlags[targetCurrency] || '🏳️'} {targetCurrency}</Text>
                        </TouchableOpacity>
                        <TextInput style={styles.input} value={convertedAmount.toString()} editable={false} />
                    </View>
                </View>

                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity onPressIn={() => scaleAnim.setValue(0.95)} onPressOut={() => scaleAnim.setValue(1)} onPress={convertCurrency}>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}>Convert</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.keypad}>
                    {numberPadKeys.map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.keypadRow}>
                            {row.map((key) => (
                                <TouchableOpacity key={key} style={styles.key} onPress={() => handleKeyPress(key)}>
                                    <Text style={styles.keyText}>{key === '<' ? '⌫' : key}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}
                </View>

                <Modal visible={showBaseModal} transparent animationType="slide">
                    <View style={styles.modalContainer}>
                        <FlatList
                            data={currencies}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => renderCurrencyItem(item, setBaseCurrency, setShowBaseModal)}
                        />
                    </View>
                </Modal>

                <Modal visible={showTargetModal} transparent animationType="slide">
                    <View style={styles.modalContainer}>
                        <FlatList
                            data={currencies}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => renderCurrencyItem(item, setTargetCurrency, setShowTargetModal)}
                        />
                    </View>
                </Modal>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    lightContainer: {
        backgroundColor: 'transparent'
    },
    darkContainer: {
        backgroundColor: '#121212'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dropdown: {
        backgroundColor: '#eee',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    dropdownText: {
        fontSize: 16,
    },
    input: {
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 10,
        width: '50%',
        fontSize: 16,
    },
    swapButton: {
        alignItems: 'center',
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    switchLabel: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 100,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalText: {
        fontSize: 18,
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
    },
    keypad: {
        marginTop: 10,
        alignItems: 'center'
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    key: {
        backgroundColor: '#ddd',
        margin: 5,
        borderRadius: 8,
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyText: {
        fontSize: 24
    }
});

export default CurrencyConverter;
