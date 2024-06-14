import React from 'react';
import { StyleSheet, Text } from 'react-native';

import colors from '../config/colors';

/*
 *  This app component acts like a <Text> wrapper, but with font and color
 *  customizations for uniform default text.
 */

function AppText({ style, weight, children, ...otherProps }) {
    /*
     *  Returns the font family name based on font weight.
     */
    function getFontFamily() {
        switch (weight) {
            case 100: 
                return 'Comfortaa-Light';
            case 200: 
                return 'Comfortaa-Regular';
            case 300: 
                return 'Comfortaa-Medium';
            case 400:
                return 'Comfortaa-SemiBold';
            case 500:
                return 'Comfortaa-Bold';
            default:
                return 'Comfortaa-Regular';
        }
    }
    
    return (
        <Text 
            style={[styles.text, {fontFamily: getFontFamily()}, style]}
            {...otherProps}
        >
            { children }
        </Text>
    );
}

const styles = StyleSheet.create({
    text: {
        color: colors.text,
        fontSize: 18,
    }
})

export default AppText;