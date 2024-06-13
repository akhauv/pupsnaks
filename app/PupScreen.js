import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReactNativeModal from 'react-native-modal';
import { ScrollView } from 'react-native-virtualized-view';
import SwipeableFlatList from 'rn-gesture-swipeable-flatlist';
import * as Yup from 'yup';

import { AppColorPicker, AppForm, AppText, FormField, Icon, Screen, SubmitButton } from '../components'
import colors from '../config/colors';
import navigation from '../config/navigation';
import pups from '../config/pups';

// DELETE!!!
pupArray=[pups.Bear, pups.Rooney, pups.Roxi];

/*
 * When editing the pup name, inputted name must exist.
 */
const nameValidationSchema = Yup.object().shape({
    name: Yup.string().required().min(1).label("Name")
});
/*
 * Other Constnats
 */
const headerHeight = 140;   // used to calculate header icon size relative to header

function PupScreen(name) {
    // remove later
    name = "Bear";

    const [pup, setPup] = useState(pups[name]);
    const [allergies, setAllergies] = useState(pup.allergies); 
    const [color, setColor] = useState(pup.color);
    const [imageUri, setImageUri] = useState(pup.imageUri);
    const [colorModalVsisible, setColorModalVisible] = useState(false);
    const [pictureModalVisible, setPictureModalVisible] = useState(false); 
    const [nameModalVisible, setNameModalVisible] = useState(false);

    const allergyValidationSchema = Yup.object().shape({
        allergy: Yup.string().required().min(1).label("Allergy").test(
            'uniqueCheck',
            'This allergy is already logged.',
            (value) => {
                for (i in allergies) {
                    if (value.toLowerCase() === allergies[i].toLowerCase()) {
                        return false;
                    }
                }
                return true;
            }
        ).test(
            'whitespaceCheck',
            'Please remove any preceding or trailing spaces.',
            (value) => value.trim().length === value.length
        )
    });

    pupArray = pupArray.filter(i => i.name != name);

    /* 
     * Deletes an item from the allergy array. triggered by swiping
     * on a list element and pressing delete.
     */
    const handleDelete = ( item ) => {
        setAllergies((allergies).filter(allergy => allergy != item));
    }

    /* 
     * Renders the modal popup to change pup color
     */
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

    /* 
     * renders an allergy list item
     */
    const renderListItem = ({ item }) => {
        return (
            <View 
                style={[styles.listItem, {backgroundColor: pup.color}]}
            >
                <AppText style={styles.listText}>{ item }</AppText>
            </View>
        );
    }

    /* 
     *  renders the popup modal to change pup name
     */

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
                        validationSchema={nameValidationSchema}
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

                <TouchableHighlight style={styles.deleteButton}>
                    <>
                        <MaterialCommunityIcons color={colors.light} name="trash-can" size={22} style={{marginRight: 5}} />
                        <AppText style={{color: colors.light}} weight={400}>Delete Pup</AppText>
                    </>
                </TouchableHighlight>
            </View>
        );
    };

    /* 
     * renders the popup modal to change pup icon
     */
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
     * renders the right swipe item of an allergy list item
     */
    const renderRightActions = (item) => {
        return (
            <View style={[styles.listRightItem, {backgroundColor: pup.color}]}>
                <View style={styles.listRightItemShade}>
                    <TouchableOpacity onPress={() => handleDelete(item)}>
                        <MaterialCommunityIcons color={colors.light} name='trash-can' size={25} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

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

            {/* ALLERGY CONTENT  */}
            <AppText style={[styles.headerText, {marginBottom: 20, marginLeft: 40, marginTop: 30}]} weight={500}>
                Allergy Profile
            </AppText>

            {/* allergy add */}
            <View style={styles.addAllergy}>
                <AppForm
                    initialValues={{allergy: ""}}
                    onSubmit={(values) => setAllergies([...allergies, values.allergy])}
                    validationSchema={allergyValidationSchema}
                >   
                <View style={{flex: 1}}>
                    <FormField 
                        name={"allergy"}
                        placeholder={"New Allergy"}
                        showError={true} 
                        style={{marginRight: 40}}
                    />
                </View>

                    <SubmitButton style={{marginLeft: -50}}>
                        <Icon 
                            backgroundColor={colors.shade} 
                            color={colors.light}
                            icon={"plus"}
                            touchable={false}
                        />
                    </SubmitButton>
                </AppForm>
            </View>

            {/* Allergy List */}
            <ScrollView
                bounces={false}
                decelerationRate={'fast'}
                showsVerticalScrollIndicator={false}
                snapToInterval={60.95}
            >
            <GestureHandlerRootView>
                <SwipeableFlatList
                    bounces={false}
                    data={allergies}
                    ItemSeparatorComponent={() => <View style={{height: 10}}/>}
                    keyExtractor={(item, index) => key = index}
                    renderItem={renderListItem}
                    renderRightActions={renderRightActions}    
                    swipeableProps={{overshootRight: false}} 
                />
            </GestureHandlerRootView>
            <View style={{height: 100}}></View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    addAllergy: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingHorizontal: 20,
        width: '100%'
    },
    deleteButton: {
        alignItems: 'center',
        backgroundColor: colors.high,
        borderRadius: 15,
        flexDirection: 'row',
        marginLeft: 'auto',
        marginTop: 10,
        paddingHorizontal: 20,
        paddingVertical: 13,
    },
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
    listItem: {
        borderRadius: 30,
        padding: 15,
        marginHorizontal: 20
    },
    listRightItem: {
        borderBottomRightRadius: 30,
        borderTopRightRadius: 30,
        width: 90,
        marginLeft: -50,
        marginRight: 20,
        overflow: 'hidden'
    },
    listRightItemShade: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 22,
    },
    listText: {
        color: colors.light, 
        textTransform: 'capitalize'
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