import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import Menu from './Menu';
import colors from '../config/colors';

function Screen({ 
    children, 
    fullscreen=false, 
    options=[],
    style 
}) {
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