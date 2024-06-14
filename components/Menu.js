import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import colors from '../config/colors';
import Icon from './Icon';

/*
 *  This comopnent renders a standard app menu based on an array of menu options.
 *  Ideally, the passed options array should contain the following fields: 
 *      - imageUri / icon
 *      - borderColor
 */

/*
 *  Size constants
 */
const iconSize = 92;
const marginSize = 4;
const cubbySize = iconSize + 2 * marginSize;

function Menu({ options=[] }) {
    return (
        <View style={styles.menuBar}>
            {/* scroll snaps to icon elements and is static otherwise */}
            <ScrollView
                bounces={false}
                decelerationRate={'fast'}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                snapToInterval={cubbySize}
                style={styles.menuScroll}
            >
                {/* each element in the passed options array is mapped to a menu icon */}
                {options.map((option, index) =>
                    <Icon
                        borderColor={option.color}
                        icon={option.icon}
                        imageUri={option.imageUri}
                        key={index}
                        size={iconSize}
                        style={styles.menuIcon}
                    />
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    menuBar: {
        backgroundColor: colors.primary,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        bottom: 0,
        height: 75,
        paddingRight: 10,
        position: 'absolute',
        width: '100%',
    },
    menuScroll: {
        overflow: 'visible',
        top: -1 * (iconSize / 2),
        transform: [{ scaleX: -1 }],
        width: '100%',
    },
    menuIcon: {
        marginHorizontal: marginSize
    }
})

export default Menu;