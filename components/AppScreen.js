import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import AppMenu from './AppMenu';
import colors from '../config/colors';

function AppScreen( { children, fullscreen=false, style } ) {
    return (
        <View style={styles.wrapper}>
            {/* fullscreen not desired */}
            { !fullscreen &&
                <SafeAreaView style={styles.content}>
                    <View style={[styles.content, style]}>
                        { children }
                    </View>
                </SafeAreaView>
            }

            {/* fullscreen desired */}
            { fullscreen &&
                <View style={[styles.content, style]}>
                    { children }
                </View>
            }

            {/* load app menu */}
            <AppMenu/>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: colors.light,
        ...StyleSheet.absoluteFillObject
    },
    content: {
        flex: 1
    }
})


export default AppScreen;