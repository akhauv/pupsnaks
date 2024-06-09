import React from 'react';
import { StyleSheet } from 'react-native';
import ReactNativeModal from 'react-native-modal';

import colors from '../config/colors';

function AppModal({ children, modalVisible, style }) {
    return (
        <ReactNativeModal 
            animationIn={"fadeInUp"}
            animationOut={"fadeOutDown"} 
            isVisible={modalVisible}
        >
            <View style={styles.modalWrapper}>
                <View style={[styles.modal, style]}>
                    
                </View>
            </View>

        </ReactNativeModal>
    );
}

const styles = StyleSheet.create({
    modal: {
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: colors.light,
        padding: 15,
        width: '85%'
    },
    modalWrapper: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
})

export default AppModal;