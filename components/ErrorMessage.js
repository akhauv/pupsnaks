import React from 'react';
import { StyleSheet } from 'react-native';

import AppText from './AppText';
import colors from '../config/colors';

/*
 *  This app component is meant specifically for formik error messages.
 *  It shows up when an error is present, otherwise stays invisible. 
 */

function ErrorMessage({ error, style, visible }) {
    if (!visible || !error) return null;

    return (
        <AppText style={[styles.error, style]}>{ error }</AppText>
    );
}

const styles = StyleSheet.create({
    error: {
        color: colors.high
    }
})

export default ErrorMessage;