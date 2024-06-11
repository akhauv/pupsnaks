import { Formik } from 'formik';
import React from 'react';

function AppForm({ initialValues, onSubmit, validationSchema, children }) {
    return (
        <Formik 
            style={{flex: 1}}
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
        >
            { () => (
                <>
                    {children}
                </>
            )} 
        </Formik>
    );
}

export default AppForm;