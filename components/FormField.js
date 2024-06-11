import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFormikContext } from 'formik';

import colors from '../config/colors';
import ErrorMessage from './ErrorMessage';

function FormField({ icon, label, name, ...otherProps }) {
    const { handleChange, setFieldTouched, errors, touched } = useFormikContext();

    return (
        <>
            <View style={styles.container}>
                {icon && <MaterialCommunityIcons name={icon} size={20} color={colors.text} style = {styles.icon} />}
                <TextInput 
                    onChangeText={handleChange(name)}
                    onBlur={() => setFieldTouched(name)}
                    placeholderTextColor={colors.unknown}
                    style={styles.text} 
                    {...otherProps}
                />
            </View>

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