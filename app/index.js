import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import * as Font from "expo-font";

import fonts from '../config/fonts';
import PupScreen from './PupScreen';

function index() {
    const [isReady, setIsReady] = useState(false);

    // load prerequisites upon app launch
    useEffect(() => {
        async function prepare() {
            try {
                await Font.loadAsync(fonts)
            } finally {
                setIsReady(true);
            }
        }
        prepare();
    }, []);
    
    // if prerequisites have not loaded, exit app
    if (!isReady) {
        return null; 
    }

    return (
        <PupScreen />
    );
}

const styles = StyleSheet.create({
    fullScreenView: {
        ...StyleSheet.absoluteFillObject
    }
})

export default index;