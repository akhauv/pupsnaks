import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import colors from '../config/colors';

function getFontFamily(weight) {
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

function AppText({ style, weight = 200, children, ...otherProps }) {
    return (
        <Text 
            style={[styles.text, {fontFamily: getFontFamily(weight)}, style]}
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