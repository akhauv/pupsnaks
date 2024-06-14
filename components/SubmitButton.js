import React from 'react';
import { TouchableOpacity } from 'react-native';

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
            onPress={handleSubmit}
        >
            { children }
        </TouchableOpacity>

    );
}

export default SubmitButton;