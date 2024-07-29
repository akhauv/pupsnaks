import React, { useEffect, useState } from 'react';
import { Alert, ImageBackground, ScrollView, StyleSheet, TouchableOpacity, TouchableHighlight, View } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { DragSortableView } from 'react-native-drag-sort';
import ReactNativeModal from 'react-native-modal';
import * as Yup from 'yup';

import { AppColorPicker, AppText, AppForm, Icon, FormField, Screen, SubmitButton } from '../components'
import colors from '../config/colors.js';
import nav from '../config/nav.js';
import pups from '../config/pups.js';

/*
 *  This screen renders the app home screen, which features a greeting, account settings, and a 
 *  rearrangable list of all current pups. 
 */

const data=[pups.Bear, pups.Roxi, pups.Rooney];

/*
 *  Menu options
 */
const menuOptions = [nav.camera, nav.search]
/*
 *  Other Constants
 */
const width = 370;                      // width of pup list
const childWidth = width / 2;           // width of pup list component
const childHeight = childWidth - 20;    // height of pup width component
const childMargin = 45;                 // margin of pup list component

function HomeScreen() {
    const [color, setColor] = useState(colors.tertiary);        // new pup color
    const [imageUri, setImageUri] = useState(null);             // new pup image
    const [modalVisible, setModalVisible] = useState(false);    // new pup modal state
    const [pups, setPups] = useState(data);                     // list of all pups
    const [scrollEnabled, setScrollEnabled] = useState(true);   // false when reordering pups

    /*
     *  The names of new pups must be unique and have zero preceding or trailing whitespace for
     *  validation purposes. 
     */
    const validationSchema = Yup.object().shape({
        name: Yup.string().required().min(1).label("Name").test(
            // names must be unique
            'uniqueCheck',
            'You already have a pup under this name.',
            (value) => {
                for (i in pups) {
                    if (value.toLowerCase() === pups[i].name.toLowerCase()) {
                        return false;
                    }
                }
                return true;
            }
        ).test(
            // names must have no surrounding whitespace
            'whitespaceCheck',
            'Please remove any preceding or trailing spaces.',
            (value) => value.trim().length === value.length
        )
    });

    /*
     * Requests image library access. Only runs once.
     */
    useEffect (() => {
        requestPermission(); 
    }, [])

    /*
     *  adds a new pup to the list when prompted by the 'add' button.
     */
    const addPup = (name, color, imageUri) => {
        const newPup = {
            name: name,
            color: color,
            imageUri: imageUri,
            allergies: [],
        };
        setPups([...pups, newPup]);
    }

    /*
     * renders an individual list item for the DragSortableView of all pups. Icon
     * touchables need to be disabled because they contradict the list's touchables.  
     */
    const renderItem = item => {
        return (
            <View style={styles.listItem}>
                {/* icon */}
                <Icon 
                    backgroundColor={colors.shade}
                    borderColor={item.color}
                    color={item.color}
                    icon={"paw"}
                    imageUri={item.imageUri}
                    touchable={false}
                    size={115}
                />

                {/* pet name */}
                <AppText weight={500} style={[styles.listPetName, {color: item.color}]}>
                    { item.name }
                </AppText>
            </View>
        );
    };
    
    /*
     * Renders the modal for adding a new pup. 
     */
    const renderModal = () => {
        return (
            <View style={styles.modalWrapper}>
                <AppForm
                    initialValues={{name: ""}}
                    validationSchema={validationSchema}
                    
                    // on submit, pup is added and the modal is reset and closed. 
                    onSubmit={values => {
                        addPup(values.name, color, imageUri);
                        resetModal();
                    }}
                >
                    <View style={[styles.modal, {marginBottom: 10}]}>

                        {/* name input area */}
                        <FormField autoCorrect={false} name="name" placeholder="name" />

                        <View style={[styles.inputRow, {marginTop: 10}]}>
                            {/* color picker which updates color state variable */}
                            <AppColorPicker 
                                initialColor={colors.tertiary}
                                handleChange={(newColor) => setColor(newColor)}
                            />

                            <View style={{alignItems: 'center', flex: 1, marginLeft: 10}}>
                                {/* icon display of new pup */}
                                <Icon 
                                    backgroundColor={colors.shade}
                                    borderColor={color}
                                    color={colors.light}
                                    icon={"paw"}
                                    imageUri={imageUri}
                                    size={80}

                                    // When icon is pressed, either prompts an image upload or deletes the current image.
                                    onPress={() => {
                                        if (imageUri) Alert.alert('Delete', 'Are you sure you want to delete this image?', [
                                            { text: 'Yes', onPress: () => setImageUri(null) },
                                            { text: 'No' }])
                                        else selectImage();
                                    }}
                                />

                                {/* image input browser */}
                                <TouchableHighlight style={styles.iconButton} onPress={() => selectImage()}>
                                    <View style={styles.row}>
                                        <MaterialCommunityIcons color={colors.text} name='camera' size={30}/>
                                        <AppText style={styles.uploadIconText}>icon</AppText>
                                    </View>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>

                    {/* create and cancel buttons */}
                    <View style={[styles.row, {width: '85%'}]}>

                        {/* create button. onPress: submits name form and resets modal */}
                        <SubmitButton style={[styles.modalButton, {backgroundColor: colors.tertiary, marginRight: 10}]}>
                            <AppText style={styles.modalButtonText} weight={400}>Create</AppText>
                        </SubmitButton>

                        {/* cancel button */}
                        <TouchableOpacity 
                            style={[styles.modalButton, {backgroundColor: colors.secondary}]}
                            onPress={resetModal}
                        >
                            <AppText style={styles.modalButtonText} weight={400}>Cancel</AppText>
                        </TouchableOpacity>

                    </View>
                </AppForm>
            </View>
        );
    }

    /* 
     * resets the pup creation modal when closed.
     */
    const resetModal = () => {
        setModalVisible(false);
        setImageUri(null);
    }

    /*
     *  requests the permissions to access image library
     */
    const requestPermission = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) 
            alert('Library permissions are needed to access your pet pics!');
    } 

    /*
     * prompts image selection from user's image library and sets imageUri to it. 
     */
    const selectImage = async () => {
        try {
            const { assets } = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.5  
            }); 

            // 'assets' is returned by ImagePicker. The 0'th index contains all relevant information.
            if (assets) 
                setImageUri(assets[0].uri)
        } catch (error) {
            console.log('Error reading an image', error);
        }
    }

    return (
        <Screen fullscreen={true} options={menuOptions}>
            {/* pup creation modal */}
            <ReactNativeModal animationIn={"fadeInUp"} animationOut={"fadeOutDown"} isVisible={modalVisible}>
                { renderModal() }
            </ReactNativeModal>

            {/* image header */}
            <ImageBackground source={require('../assets/images/sunset.png')} style={styles.image}>
                <AppText style={[styles.greeting, {color: colors.primary}]} weight={500}>
                    Morning,
                </AppText>
                <AppText style={[styles.greeting, {color: colors.shadow}]} weight={500}>
                    Amber!
                </AppText>
            </ImageBackground>

            {/* content */}
            <View style={styles.container}>
                {/* header */}
                <View style={styles.headerContainer}>
                    {/* header label */}
                    <View style={styles.header}>
                        <AppText style={styles.headerText} weight={500}>Pups</AppText>
                    </View>

                    {/* settings icon */}
                    <TouchableOpacity style={{overflow: 'visible'}}>
                        <MaterialCommunityIcons color={colors.shade} name={"cog"} size={54} style={styles.button} />
                    </TouchableOpacity>

                    {/* facts icon */}
                    <TouchableOpacity>
                        <MaterialCommunityIcons color={colors.shade} name={"paw"} size={54} style={styles.button} />
                    </TouchableOpacity>
                </View>

                {/* list of all pups */}
                <View style={styles.pupContent}>
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        decelerationRate={'fast'}
                        scrollEnabled={scrollEnabled} // draggability  only when pups are not being rearranged
                        showsVerticalScrollIndicator={false}
                        snapToInterval={childHeight + childMargin}
                    >
                        {/* all pups displayed and draggable */}
                        <DragSortableView
                            childrenHeight={childHeight}
                            childrenWidth={childWidth}
                            marginChildrenTop={childMargin}
                            minOpacity={100}
                            parentWidth={width}

                            dataSource={pups}
                            keyExtractor={(item, index) => key = index}
                            onDataChange={(pups) => {setPups(pups)}}
                            onDragEnd={() => setScrollEnabled(true)}    // controls parent scrollview draggability
                            onDragStart={() => setScrollEnabled(false)} // controls parent scrollview draggability
                            renderItem={(item) => {
                                return renderItem(item)
                            }}
                        />

                        {/* pup creation button. if the button is on a new row, it positions itself naturally in that row.
                            if putton is on the same row as a pup, then it positions itself based on the number of rows
                            displayed mathematically. */}
                        <View style={[
                            styles.dragContainer,
                            pups.length % 2 !== 0 ? {
                                position: 'absolute',
                                top: parseInt(pups.length / 2) * (childHeight + childMargin) - 32,
                                left: childWidth,
                                zIndex: 999,
                            } : {}
                        ]}>
                            <Icon 
                                backgroundColor={colors.shade}
                                color={colors.light}
                                icon="plus" size={70}

                                // pulls up the new pup modal
                                onPress={() => {setModalVisible(true)}}
                            />
                        </View>
                    </ScrollView>

                    {/* gradient for smooth scrolling transition */}
                    <LinearGradient
                        colors={[colors.light, 'rgba(255, 255, 255, 0)']}
                        style={styles.gradient}
                    />
                </View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    button: {
        marginHorizontal: 3,
        top: -2.25,
    },
    container: {
        alignItems: 'center',
        backgroundColor: colors.light,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        flex: 1,
        overflow: 'visible',
        paddingTop: 40,
        top: -30
    },
    dragContainer: {
        alignItems: 'center',
        height: childHeight,
        justifyContent: 'center',
        marginTop: childMargin,
        width: childWidth,
    },
    gradient: {
        height: childMargin,
        position: 'absolute',
        top: 0,
        width: '100%'
    },
    greeting: {
        fontSize: 30,
    },
    header: {
        backgroundColor: colors.shade,
        borderBottomRightRadius: 50,
        borderTopRightRadius: 50,
        flexDirection: 'row-reverse',
        marginRight: 4,
        width: '50%'
    },
    headerContainer: {
        flexDirection: 'row',
        height: 50,
        width: '100%',
    },
    headerText: {
        color: colors.light,
        fontSize: 27,
        marginRight: 25,
        marginVertical: 'auto'
    },
    iconButton: {
        alignItems: 'center',
        backgroundColor: colors.shade,
        borderRadius: 25,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        marginHorizontal: 10,
        padding: 15,
        width: '100%'
    },
    image: {
        alignItems: 'center',
        flex: 0.4,
        justifyContent: 'center'
    },
    inputRow: {
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%'
    },
    listItem: {
        alignItems: 'center',
        width: width / 2
    },
    listPetName: {
        fontSize: 22,
        marginTop: 10,
        textAlign: 'center',
        textTransform: 'capitalize'
    },
    modal: {
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: colors.light,
        padding: 15,
        width: '85%'
    },
    modalButton: {
        alignItems: 'center',
        backgroundColor: colors.safe,
        borderRadius: 15,
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    modalButtonText: {
        color: colors.light
    },
    modalWrapper: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    pupContent: {
        alignItems: 'center',
        height: '100%',
        width: '100%'
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    scroll: {
        paddingBottom: childHeight
    },
    uploadIconText: {
        fontSize: 14,
        marginLeft: 7
    }
})

export default HomeScreen;