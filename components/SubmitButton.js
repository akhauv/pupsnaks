import React from 'react';
import { Keyboard, TouchableOpacity } from 'react-native';

import { useFormikContext } from 'formik';

/*
 *  This app component creates a form submission button. It is
 *  only valid whin a Formik or AppForm component. 
 */

function SubmitButton({ children, style }) {
    const { handleSubmit } = useFormikContext(); 
    return (
        <TouchableOpacity 
            style={style}
            onPress={() => {
                handleSubmit();
                Keyboard.dismiss();
            }}
        >
            { children }
        </TouchableOpacity>

    );
}

export default SubmitButton;