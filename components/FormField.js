import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFormikContext } from 'formik';

import colors from '../config/colors';
import ErrorMessage from './ErrorMessage';

/*
 *  This app component is a text input field complete with Formik validation. It is only viable within a
 *  Formik / AppForm component. 
 */

function FormField({ icon, label, name, style, ...otherProps }) {
    /* pull outside Formik context */
    const { handleChange, setFieldTouched, errors, touched } = useFormikContext();

    return (
        <>
            <View style={[styles.container]}>
                {/* if desired, an icon to the left of the text input */}
                {icon && <MaterialCommunityIcons color={colors.text} name={icon} size={20} style = {styles.icon} />}

                {/* text input */}
                <TextInput 
                    onChangeText={handleChange(name)}
                    onBlur={() => setFieldTouched(name)}
                    placeholderTextColor={colors.unknown}
                    style={[styles.text, style]} 
                    {...otherProps}
                />

            </View>

            {/* error message */}
            <ErrorMessage error={errors[name]} visible={touched[name]} style={styles.error} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.shade,
        borderRadius: 25,
        flexDirection: "row",
        width: '100%',
        padding: 15,
    },
    error: {
        alignSelf: 'flex-start',
        marginTop: 5,
        marginLeft: 10
    },
    icon: {
        marginRight: 10,
        marginTop: 'auto',
        marginBottom: 'auto'
    },
    text: {
        color: colors.text, 
        flex: 1,
        fontFamily: 'Comfortaa-Regular',
        fontSize: 18,
    }
})

export default FormField;