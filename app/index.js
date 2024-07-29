import React, { useState, useEffect } from 'react';
import * as Font from "expo-font";

import fonts from '../config/fonts';
import AnalysisScreen from './AnalysisScreen';
import Pups from '../config/pups';
import HomeScreen from './HomeScreen.js'
import PupScreen from './PupScreen.js';
import CameraScreen from './CameraScreen.js';

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
        <AnalysisScreen />
    );
}

export default index;