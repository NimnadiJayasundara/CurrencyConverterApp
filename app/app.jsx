import React from 'react';
import { SafeAreaView } from 'react-native';
import CurrencyConverter from './components/CurrencyConverter.jsx';


const App = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <CurrencyConverter />
        </SafeAreaView>
    );
};
 
export default App;
