import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import navigation from '../config/navigation';
import colors from '../config/colors';
import AppIcon from './AppIcon';

// size constants
const iconSize = 92;
const marginSize = 4;
const cubbySize = iconSize + 2 * marginSize;

function AppMenu({ options=[] }) {
    // CHANGE LATER!
    /*
    The passed options array should ideally contain the following fields: 
        - name
        - imageUri / icon
        - borderColor
    */
    options = [navigation.home, navigation.camera, navigation.search];

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
                {/* each element in the passed options array gets an icon */}
                {options.map(option =>
                    <AppIcon
                        borderColor={option.color}
                        icon={option.icon}
                        imageUri={option.imageUri}
                        key={option.name}
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

export default AppMenu;