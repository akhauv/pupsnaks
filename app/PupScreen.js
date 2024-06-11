import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReactNativeModal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker'
import DraggableFlatList from 'react-native-draggable-flatlist';
import SwipeableFlatList from 'react-native-swipeable-list';
import * as Yup from 'yup';
import { Formik } from 'formik';

import Screen from '../components/Screen';
import navigation from '../config/navigation';
import pups from '../config/pups';
import colors from '../config/colors';
import Icon from '../components/Icon';
import AppText from '../components/AppText';
import AppColorPicker from '../components/AppColorPicker';
import AppForm from '../components/AppForm';
import SubmitButton from '../components/SubmitButton';
import FormField from '../components/FormField';

const validationSchema = Yup.object().shape({
    name: Yup.string().required().min(1).label("Name")
});

pupArray=[pups[1], pups[2], pups[3]];
const headerHeight = 140;

function PupScreen(key) {
    // remove later
    key=1;
    const [pup, setPup] = useState(pups[key]);
    const [color, setColor] = useState(pup.color);
    const [imageUri, setImageUri] = useState(pup.imageUri);
    const [colorModalVsisible, setColorModalVisible] = useState(false);
    const [pictureModalVisible, setPictureModalVisible] = useState(false); 
    const [nameModalVisible, setNameModalVisible] = useState(false);

    pupArray = pupArray.filter(pup => pup.key != key);

    const renderColorModal = () => {
        return (
            <View style={styles.modalWrapper}>
                <View style={styles.modal}>
                    <AppColorPicker 
                        initialColor={pup.color}
                        handleChange={(newColor) => setColor(newColor)}
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
                            <MaterialCommunityIcons color={colors.secondary} name="close" size={30}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderNameModal = () => {
        return (
            <View style={styles.modalWrapper}>
                <View style={styles.modal}>
                    <AppForm
                        initialValues={{name: ""}}
                        onSubmit={values => {
                            pup.name = values.name;
                            setPup(pup);
                            setNameModalVisible(false);
                        }}
                        validationSchema={validationSchema}
                    >
                        {/* name input area */}
                        <FormField autoCorrect={false} name="name" placeholder="name" />

                        <View style={[styles.modalRow, {marginTop: 10}]}>
                            <SubmitButton style={{marginRight: 'auto'}}>
                                <MaterialCommunityIcons color={colors.tertiary} name="check" size={30}/>
                            </SubmitButton>

                            <TouchableOpacity
                                onPress={() => setNameModalVisible(false)}
                            >
                                <MaterialCommunityIcons color={colors.secondary} name="close" size={30}/>
                            </TouchableOpacity>
                        </View>   
                    </AppForm>
                </View>
            </View>
        );
    };

    const renderPictureModal = () => {
        return (
            <View style={styles.modalWrapper}>
                <View style={styles.modal}>
                    <Icon 
                        backgroundColor={colors.shade}
                        color={colors.light}
                        imageUri={imageUri}
                        size={150}

                        onPress={() => {
                            if (imageUri) Alert.alert('Delete', 'Are you sure you want to delete this image?', [
                                { text: 'Yes', onPress: () => setImageUri(null) },
                                { text: 'No' }])
                            else selectImage();
                        }}
                    />

                    <View style={styles.modalRow}>
                        <TouchableOpacity 
                            style={{marginRight: 'auto'}}
                            onPress={() => {
                                pup.imageUri = imageUri;
                                setPup(pup);
                                setPictureModalVisible(false);
                            }}
                        >
                            <MaterialCommunityIcons color={colors.tertiary} name="check" size={30}/>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setImageUri(pup.imageUri);
                                setPictureModalVisible(false);
                            }}
                        >
                            <MaterialCommunityIcons color={colors.secondary} name="close" size={30}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    /*
     * selects an image form image library and sets imageUri to it. 
     */
    const selectImage = async () => {
        try {
            const { assets } = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.5  
            }); 
            if (assets) {
                setImageUri(assets[0].uri);
            }
        } catch (error) {
            console.log('Error reading an image', error);
        }
    }

    return (
        <Screen options={[navigation.home, ...pupArray]}>
            {/* picture modal */}
            <ReactNativeModal animationIn={"fadeInUp"} animationOut={"fadeOutDown"} isVisible={pictureModalVisible}>
                { renderPictureModal() }
            </ReactNativeModal>

            {/* colors modal */}
            <ReactNativeModal animationIn={"fadeInUp"} animationOut={"fadeOutDown"} isVisible={colorModalVsisible}>
                { renderColorModal() }
            </ReactNativeModal>

            {/* name modal */}
            <ReactNativeModal animationIn={"fadeInUp"} animationOut={"fadeOutDown"} isVisible={nameModalVisible}>
                { renderNameModal() }
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
                            onPress={() => setPictureModalVisible(true)}
                        >
                            <MaterialCommunityIcons 
                                color={colors.light}
                                name="camera"
                                size={33}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => setColorModalVisible(true)}
                        >
                            <MaterialCommunityIcons 
                                color={colors.light}
                                name="brush"
                                size={33}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => setNameModalVisible(true)}
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

            {/* <DraggableFlatList
            /> */}
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