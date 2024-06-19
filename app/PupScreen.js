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

/*
 *  This screen renders pup information. It features editing abilities for a pup's icon, color, and name,
 *  and an editable list of the pup's allergies. 
 */

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
    // remove later: temporary assignmetn
    name = "Bear";
    const [pup, setPup] = useState(pups[name]);                                     // current pup information
    const menuOptions = [navigation.home, ...pupArray.filter(i => i.name != name)]  // dynamic menu containing other pups

    const [allergies, setAllergies] = useState(pup.allergies);                      // list of current pup allergies
    const [color, setColor] = useState(pup.color);                                  // pup color
    const [colorModalVsisible, setColorModalVisible] = useState(false);             // color change modal state
    const [imageUri, setImageUri] = useState(pup.imageUri);                         // pup icon image uri
    const [nameModalVisible, setNameModalVisible] = useState(false);                // name change modal state
    const [pictureModalVisible, setPictureModalVisible] = useState(false);          // icon change modal state

    /*
     *  The names of new allergies must be unique and have zero preceding or trailing whitespace for
     *  validation purposes. 
     */
    const allergyValidationSchema = Yup.object().shape({
        allergy: Yup.string().required().min(1).label("Allergy").test(
            // allergies must be unique
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
            // no whitespace for validation purposes
            'whitespaceCheck',
            'Please remove any preceding or trailing spaces.',
            (value) => value.trim().length === value.length
        )
    });

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
                    {/* color picker */}
                    <AppColorPicker 
                        initialColor={pup.color}
                        handleChange={(newColor) => setColor(newColor)}
                    />

                    <View style={styles.modalRow}>
                        {/* finalize change button */}
                        <TouchableOpacity 
                            style={{marginRight: 'auto'}}

                            // reassigns color and closes modal on submit
                            onPress={() => {
                                pup.color = color;
                                setColorModalVisible(false);
                            }}
                        >
                            <MaterialCommunityIcons color={colors.tertiary} name="check" size={30}/>
                        </TouchableOpacity>

                        {/* exit modal button */}
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
            <View style={[styles.listItem, {backgroundColor: pup.color}]}>
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
                {/* name edit section  */}
                <View style={styles.modal}>
                    <AppForm
                        initialValues={{name: ""}}
                        validationSchema={nameValidationSchema}

                        /* renames pup and closes modal on submit */
                        onSubmit={values => {
                            pup.name = values.name;
                            setNameModalVisible(false);
                        }}
                    >
                        {/* name input area */}
                        <FormField autoCorrect={false} name="name" placeholder="name" />

                        <View style={[styles.modalRow, {marginTop: 10}]}>
                            {/* formik submit button */}
                            <SubmitButton style={{marginRight: 'auto'}}>
                                <MaterialCommunityIcons color={colors.tertiary} name="check" size={30}/>
                            </SubmitButton>

                            {/* exit modal button */}
                            <TouchableOpacity onPress={() => setNameModalVisible(false)}>
                                <MaterialCommunityIcons color={colors.secondary} name="close" size={30}/>
                            </TouchableOpacity>

                        </View>   
                    </AppForm>
                </View>

                {/* Delete Pup Section */}
                <TouchableHighlight style={styles.deleteButton}>
                    <>
                        <MaterialCommunityIcons color={colors.light} name="trash-can" size={22} style={{marginRight: 5}} />
                        <AppText style={styles.deleteButtonText} weight={400}>Delete Pup</AppText>
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
                    {/* chosen icon display */}
                    <Icon 
                        backgroundColor={colors.shade}
                        color={colors.light}
                        icon={"paw"}
                        imageUri={imageUri}
                        size={150}

                        /* prompts image select if no icon has been ulpoaded, or deletes chosen image if icon exists */
                        onPress={() => {
                            if (imageUri) Alert.alert('Delete', 'Are you sure you want to delete this image?', [
                                { text: 'Yes', onPress: () => setImageUri(null) },
                                { text: 'No' }])
                            else selectImage();
                        }}
                    />

                    <View style={styles.modalRow}>
                        {/* save changes button */}
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

                        {/* cancel button */}
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
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.listRightItemShade}

                    /* triggers item delete from allergies list */
                    onPress={() => handleDelete(item)}
                >
                    <MaterialCommunityIcons color={colors.light} name='trash-can' size={25} />
                </TouchableOpacity>
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

            // 'assets' is returned by ImagePicker. The 0'th index contains all relevant information.
            if (assets) {
                setImageUri(assets[0].uri);
            }
        } catch (error) {
            console.log('Error reading an image', error);
        }
    }

    return (
        <Screen options={menuOptions}>
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
                    icon={"paw"}
                    imageUri={pup.imageUri}
                    padding={false}
                    size={headerHeight}
                />

                <View style={styles.headerContent}>
                    {/* pup name */}
                    <AppText style={[styles.headerText, {color: pup.color}]} weight={500}>
                        { pup.name }
                    </AppText>

                    {/* row of edit options */}
                    <View style={styles.headerRow}>

                        {/* edit pup icon; triggers icon modal */}
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

                        {/* edit pup color; triggers color modal */}
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

                        {/* edit pup name or delet pup; triggers edit modal */}
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
            <AppText style={[styles.headerText, styles.allergyHeader]} weight={500}>
                Allergy Profile
            </AppText>

            {/* allergy add */}
            <View style={styles.addAllergy}>
                <AppForm
                    initialValues={{allergy: ""}}
                    onSubmit={(values) => setAllergies([...allergies, values.allergy])}
                    validationSchema={allergyValidationSchema}
                >
                    {/* allergy creation field */}
                    <View style={{flex: 1}}>
                        <FormField 
                            name={"allergy"}
                            placeholder={"New Allergy"}
                            style={{marginRight: 40}}
                        />
                    </View>

                    {/* allergy submission icon */}
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
                {/* allergy list, which is swipeable to delete */}
                <GestureHandlerRootView>
                    <SwipeableFlatList
                        bounces={false}
                        ItemSeparatorComponent={() => <View style={{height: 10}}/>}
                        keyExtractor={(item, index) => index.toString()}
                        swipeableProps={{overshootRight: false}} 

                        data={allergies}
                        renderItem={renderListItem}
                        renderRightActions={renderRightActions}    
                    />
                </GestureHandlerRootView>

                {/* extra spacer at the end so last items are not obscured by the menu */}
                <View style={styles.listBottomSpacer}></View>
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
    allergyHeader: {
        marginBottom: 20,
        marginLeft: 40,
        marginTop: 30
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
    deleteButtonText: {
        color: colors.light
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
    listBottomSpacer: {
        height: 100
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