import React, { useState, useEffect } from 'react';
import * as Font from "expo-font";

import fonts from '../config/fonts';
import PupScreen from './PupScreen';
import HomeScreen from './HomeScreen';
import CameraScreen from './CameraScreen';
import Pups from '../config/pups';
import AnalysisScreen from './AnalysisScreen';

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

export default index;