import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import colors from '../config/colors';
import Menu from './Menu';

/*
 *  This component creates a standard wrapper for an app screen with a menu. 
 */

function Screen({ 
    children,           // children rendered within screen
    fullscreen=false,   // screens may be fullscreen or within phone safe area
    options=[],         // menu options
    style               // additional style specifications
}) {
    /*
     *  renders general screen wrapper
     */
    const renderScreen = () => {
        return (
            <View style={[styles.content, style]}>
                { children }
            </View>
        );
    }
    return (
        <View style={styles.wrapper}>
            {/* fullscreen not desired */}
            { !fullscreen &&
                <SafeAreaView style={styles.content}>
                    { renderScreen() }
                </SafeAreaView>
            }

            {/* fullscreen desired */}
            { fullscreen && <>{renderScreen() }</>}

            {/* load app menu */}
            <Menu options={options}/>
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


export default Screen;