import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ColorPicker, { HueCircular, Panel1 } from 'reanimated-color-picker'

import colors from '../config/colors';
import AppText from './AppText';

function AppColorPicker({ 
    handleChange,
    initialColor = colors.tertiary,
    size = 150
}) {
    const [color, setColor] = useState(colors.tertiary);

    return (
        <View style={styles.container}>
            <ColorPicker 
                adaptSpectrum={true}
                alignItems='center'
                justifyContent='center'
                value={initialColor}
                onChange={color => setColor(color.hex)}
                onComplete={color => handleChange(color.hex)}
            >
                <HueCircular 
                    thumbShape={"hollow"}
                    thumbSize={20}
                    sliderThickness={10}
                    style={[styles.outerPanel, {height: size, width: size}]}
                >
                    <Panel1 style={[styles.innerPanel, {borderRadius: size / 2, margin: 5}]} />
                </HueCircular>
            </ColorPicker>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center'
    },
    innerPanel: {
        flex: 1
    },
})

export default AppColorPicker;