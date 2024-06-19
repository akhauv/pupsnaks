import React from 'react';
import { Image, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons'

import colors from '../config/colors';

/*
 *  This app component creates a custom circular icon with (if specified) a circular orbit border.
 *  It can contain an image or a vector icon. 
 */

function Icon({
    backgroundColor = colors.light,     // background icon color
    borderColor,                        // orbit border color
    borderWidth,                        // orbit border width
    color = colors.shade,               // vector icon color
    icon,                               // vector icon name
    iconSize,                           // size of inner icon
    imageUri,                           // image address
    onPress,                            // onPress to make icon clickable. only valid if touchable
    touchable = true,                   // determines whether icon will be nested in a toucahble component
    padding = true,                     // padding between orbit and icon
    size = 50,                          // icon size
    style                               // additional style of border component 
}) {

    /*
     *  This function renders the main content of the icon
     */
    const renderContent = () => {
        return (
            <View style={[
                /* border only shows if borderColor is a declared property. */
                styles.border,
                {
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
                    {!imageUri && icon && <MaterialCommunityIcons
                        color={color}
                        name={icon}
                        size={iconSize ? iconSize : (borderColor ? 0.5 * size : 0.6 * size)}
                    />}
                </View>
            </View>
        );
    };

    return (
        <>
            {/* because some parents may require content to not be within a touchable component, content may be rendered 
            within a touchable compoennt or a regular view.  */}
            {touchable && <TouchableWithoutFeedback onPress={onPress}>{ renderContent() }</TouchableWithoutFeedback>}
            {!touchable && <View>{ renderContent() }</View>}
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