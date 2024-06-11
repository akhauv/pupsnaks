import React from 'react';
import { Image, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'

import colors from '../config/colors';

function Icon({
    backgroundColor = colors.light,
    borderColor,
    borderWidth,
    color = colors.shade,
    icon = "paw",
    imageUri,
    onPress,
    touchable = true,
    padding = true,
    size = 50,
    style
}) {

    const configureContent = () => {
        return (
            <View style={[
                styles.border,
                {
                    // border only shows if borderColor is a declared property. 
                    borderColor: borderColor ? borderColor : backgroundColor,
                    borderRadius: 0.5 * size,
                    borderWidth: borderColor ? (borderWidth ? borderWidth : size * 0.045) : 0,
                    height: size,
                    padding: padding ? (borderColor ? size * 0.045 : 0) : 0,
                    width: size,
                },
                style
            ]}>
                <View style={[styles.background, { backgroundColor: backgroundColor, borderRadius: 0.5 * size }]}>
                    {/* render image URI if it exists */}
                    {imageUri && <Image source={{uri: imageUri}} style={styles.image}/>}

                    {/* render icon if image URI doesn't exist */}
                    {!imageUri && <MaterialCommunityIcons
                        color={color}
                        name={icon}
                        size={borderColor ? 0.5 * size : 0.6 * size}
                    />}
                </View>
            </View>
        );
    };

    return (
        <>
            {touchable && <TouchableWithoutFeedback onPress={onPress}>{ configureContent() }</TouchableWithoutFeedback>}
            {!touchable && <View>{ configureContent() }</View>}
        </>
    );
}

const styles = StyleSheet.create({
    border: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    background: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        overflow: 'hidden',
        width: '100%'
    },
    image: {
        height: '100%',
        width: '100%'
    },
})

export default Icon;