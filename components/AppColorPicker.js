import React from 'react';
import { StyleSheet, View } from 'react-native';

import ColorPicker, { HueCircular, Panel1 } from 'reanimated-color-picker'

import colors from '../config/colors';

/*
 * This app component is a color picker featuring an outer circular hue picker and inner
 * saturation / darkness picker. Via callback, it can be used to update an outer color state 
 * variable. 
 */

function AppColorPicker({ 
    handleChange,
    initialColor = colors.tertiary,
    size = 150
}) {
    return (
        <View style={styles.container}>
            <ColorPicker 
                adaptSpectrum={true}
                alignItems='center'
                justifyContent='center'
                value={initialColor}
                onComplete={color => handleChange(color.hex)}
            >
                {/* outer circular hue selection */}
                <HueCircular 
                    thumbShape={"hollow"}
                    thumbSize={20}
                    sliderThickness={10}
                    style={[styles.outerPanel, {height: size, width: size}]}
                >
                    {/* inner saturation and darkness picker */}
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