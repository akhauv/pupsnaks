import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AppText from './AppText';
import colors from '../config/colors';

const toxicityLevels = ['safe', 'low', 'medium', 'high', 'conditional'];

function AnalysisModal({
    activeIngredient,
    color=null,
    onClose,
    showToxicityBar=false,
    children,
    ...otherProps
}) {
    if (!activeIngredient) return <></>

    const renderToxicityBar = () => {
        {/* toxicity bar */}
        return (
            <View style={styles.toxicityRow}>
                {toxicityLevels.map((toxicityLevel, index) => 
                    <View key={index} style={styles.toxicitySubRow}>

                        {/* color circle indicating toxicity */}
                        <View style={[
                            toxicityLevel === activeIngredient.toxicity ? styles.toxicityCueActive : styles.toxicityCue,
                            {backgroundColor: colors[toxicityLevel]}
                        ]}/>

                        {/* label containing current ingredient toxicity */}
                        {toxicityLevel === activeIngredient.toxicity &&
                            <AppText style={[styles.toxicityCueText, {color: colors[toxicityLevel]}]}>
                                { toxicityLevel } {(toxicityLevel !== 'conditional') && (toxicityLevel !== 'safe') && "toxicity"}
                            </AppText>                                    
                        }
                    </View>
                )}
            </View>
        );
    }

    return (
        <ReactNativeModal
            animationIn={'fadeInUp'}
            animationOut={'fadeOutDown'}
            backdropColor={color ? color : colors[activeIngredient.toxicity]}
            backdropOpacity={0.55}
            onBackdropPress={() => onClose()}
            {...otherProps}
        >
            <View style={styles.modal}>
                {/* header */}
                <View style={[styles.modalHeader, {backgroundColor: color ? color : colors[activeIngredient.toxicity]}]}>
                    {/* close button */}
                    <TouchableOpacity style={styles.modalExit} onPress={() => onClose()}>
                        <MaterialCommunityIcons color={colors.light} name="close" size={25} />
                    </TouchableOpacity>

                    {/* label */}
                    <AppText style={styles.modalHeaderText} numberOfLines={2} weight={500}>
                        { activeIngredient.name }
                    </AppText>
                </View>

                {/* toxicity key */}
                { showToxicityBar &&
                    renderToxicityBar()
                }

                {/* information */}
                <ScrollView
                    bounces={false}
                    contentContainerStyle={[styles.modalTextWrapper, {paddingTop: showToxicityBar ? 0 : 19}]}
                >
                    { children }
                </ScrollView>
 
            </View>
        </ReactNativeModal>
    );
}

const styles = StyleSheet.create({
    modal: {
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: colors.light,
        overflow: 'hidden',
        width: '95%',
        marginHorizontal: 'auto',
        marginBottom: 80
    },
    modalExit: {
        position: 'absolute', 
        right: 15
    },
    modalHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 15,
        width: '100%',
    },
    modalHeaderText: {
        color: colors.light,
        fontSize: 20,
        textTransform: 'capitalize',
        textAlign: 'center',
        width: '69.8%'
    },
    modalTextWrapper: {
        paddingBottom: 20,
        paddingHorizontal: 25,
        paddingTop: 15,
        flexShrink: 1,
        width: '100%'
    },
    toxicityCue: {
        borderRadius: 9.5,
        height: 19,
        marginRight: 7,
        width: 19,
    },
    toxicityCueActive: {
        borderColor: colors.text,
        borderRadius: 11,
        borderWidth: 3,
        height: 22,
        marginRight: 7,
        width: 22,
    },
    toxicityCueText: {
        fontSize: 15, 
        marginLeft: 3,
        marginRight: 13,
        textTransform: 'capitalize'
    },
    toxicityRow: {
        alignItems: 'center',
        flexDirection: 'row', 
        marginVertical: 15,
        paddingHorizontal: 17,
        width: '100%'
    },
    toxicitySubRow: {
        alignItems: 'center', 
        flexDirection: 'row'
    }
})

export default AnalysisModal;