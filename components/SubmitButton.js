import React from 'react';
import { TouchableOpacity } from 'react-native';

import { useFormikContext } from 'formik';

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