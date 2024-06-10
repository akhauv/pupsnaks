import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import Screen from '../components/Screen';
import navigation from '../config/navigation';
import pups from '../config/pups';
import colors from '../config/colors';
import Icon from '../components/Icon';
import AppText from '../components/AppText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReactNativeModal from 'react-native-modal';
import AppColorPicker from '../components/AppColorPicker';
import DraggableFlatList from 'react-native-draggable-flatlist';

pupArray=[pups[1], pups[2], pups[3]];
const headerHeight = 140;

function PupScreen(key) {
    // remove later
    key=1;
    const [pup, setPup] = useState(pups[key]);
    const [color, setColor] = useState(pup.color);
    const [colorModalVsisible, setColorModalVisible] = useState(false);

    pupArray = pupArray.filter(pup => pup.key != key);

    const renderColorModal = () => {
        return (
            <View style={styles.modalWrapper}>
                <View style={styles.modal}>
                    <AppColorPicker 
                        initialColor={pup.color}
                        exportColor={(newColor) => setColor(newColor)}
                    />
                    <View style={styles.modalRow}>
                        <TouchableOpacity 
                            style={{marginRight: 'auto'}}
                            onPress={() => {
                                pup.color = color;
                                setPup(pup);
                                setColorModalVisible(false);
                            }}
                        >
                            <MaterialCommunityIcons color={colors.tertiary} name="check" size={30}/>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setColor(pup.color);
                                setColorModalVisible(false);
                            }}
                        >
                            <MaterialCommunityIcons color={colors.secondary} name="plus" size={30}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Screen options={[navigation.home, ...pupArray]}>
            {/* colors modal */}
            <ReactNativeModal animationIn={"fadeInUp"} animationOut={"fadeOutDown"} isVisible={colorModalVsisible}>
                { renderColorModal() }
            </ReactNativeModal>

            {/* header */}
            <View style={styles.header}>
                <Icon
                    borderColor={pup.color}
                    borderWidth={5}
                    imageUri={pup.imageUri}
                    padding={false}
                    size={headerHeight}
                />

                <View style={styles.headerContent}>
                    <AppText style={[styles.headerText, {color: pup.color}]} weight={500}>
                        { pup.name }
                    </AppText>

                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            style={styles.headerButton}
                        >
                            <MaterialCommunityIcons 
                                color={colors.light}
                                name="camera"
                                size={33}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress = {() => setColorModalVisible(true)}
                        >
                            <MaterialCommunityIcons 
                                color={colors.light}
                                name="brush"
                                size={33}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.headerButton}
                        >
                            <MaterialCommunityIcons 
                                color={colors.light}
                                name="pencil"
                                size={33}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* allergy content  */}
            <AppText style={[styles.headerText, {marginLeft: 40, marginVertical: 30}]} weight={500}>
                Allergy Profile
            </AppText>

            <DraggableFlatList
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: {
        alignSelf: 'flex-end',
        backgroundColor: colors.shade,
        borderTopLeftRadius: headerHeight / 2,
        borderBottomLeftRadius: headerHeight / 2,
        flexDirection: 'row',
        height: headerHeight,
        marginTop: 20,
        width: '85%'
    },
    headerButton: {
        marginRight: 5
    },
    headerContent: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: 20,
    },
    headerRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    headerText: {
        color: colors.primary,
        fontSize: 30
    },
    modal: {
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: colors.light,
        padding: 15,
    },
    modalRow: {
        flexDirection: 'row',
        marginTop: 10,
        width: 150
    },
    modalWrapper: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
})

export default PupScreen;