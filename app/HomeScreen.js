import React, { useEffect, useState } from 'react';
import { Alert, Button, ImageBackground, ScrollView, StyleSheet, TouchableOpacity, TouchableHighlight, View, Touchable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DragSortableView } from 'react-native-drag-sort';
import { LinearGradient } from 'expo-linear-gradient';
import ReactNativeModal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker'

import Screen from '../components/Screen.js'
import navigation from '../config/navigation.js';
import colors from '../config/colors.js';
import AppText from '../components/AppText.js';
import pups from '../config/pups.js';
import Icon from '../components/Icon.js';
import AppColorPicker from '../components/AppColorPicker.js';

const data=[pups[1], pups[2], pups[3]];
const width = 370;
const childWidth = width / 2;
const childHeight = childWidth - 20; 
const childMargin = 45;

function HomeScreen() {
    const [pups, setPups] = useState(data);
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [color, setColor] = useState(colors.tertiary);
    const [modalVisible, setModalVisible] = useState(false);
    const [imageUri, setImageUri] = useState(null);

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
            key: pups.length + 1,
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
                    imageUri={item.imageUri}
                    touchable={false}
                    size={115}
                />

                {/* pet name */}
                <AppText 
                    weight={500}
                    style={{
                        color: item.color,
                        fontSize: 22,
                        marginTop: 10,
                        textTransform: 'capitalize'
                    }}
                >
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
                <View style={[styles.modal, {marginBottom: 10}]}>
                    {/* name input area */}
                    <View style={[styles.inputRow, {marginBottom: 10}]}>
                        <AppText style={{marginLeft: 5, marginRight: 15}}>Name:</AppText>
                        <View style={styles.tempTextInputWrapper}>
                            <AppText>input</AppText>
                        </View>
                    </View>

                    {/* extra properties */}
                    <View style={styles.inputRow}>
                        {/* color picker which updates color state variable */}
                        <AppColorPicker 
                            exportColor={(newColor) => setColor(newColor)}
                            initialColor={colors.tertiary}
                        />

                        <View style={{alignItems: 'center', flex: 1, marginLeft: 10}}>
                            {/* icon display of new pup. clicking deletes image */}
                            <Icon 
                                backgroundColor={colors.shade}
                                borderColor={color}
                                color={colors.light}
                                imageUri={imageUri}
                                size={80}

                                onPress={() => {
                                    if (imageUri) Alert.alert('Delete', 'Are you sure you want to delete this image?', [
                                        { text: 'Yes', onPress: () => setImageUri(null) },
                                        { text: 'No' }])
                                }}
                            />

                            {/* image input browser */}
                            <Button title="hehe"
                                onPress={selectImage()}/>
                            {/* <TouchableHighlight style={styles.iconButton}>
                                <View style={styles.row}>
                                    <MaterialCommunityIcons color={colors.text} name='camera' size={30}/>
                                    <AppText style={{fontSize: 14, marginLeft: 7}}>icon</AppText>
                                </View>
                            </TouchableHighlight> */}
                        </View>
                    </View>
                </View>

                {/* create and cancel buttons */}
                <View style={[styles.row, {alignContent: 'space-between', width: '85%'}]}>
                    <TouchableOpacity 
                        style={[styles.modalButton, {backgroundColor: colors.tertiary, marginRight: 5}]}
                        onPress={() => {
                            addPup("custom pup", color, null);
                            setModalVisible(false);
                        }}
                    >
                        <AppText style={{color: colors.light,}} weight={400}>Create</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.modalButton, {backgroundColor: colors.secondary, marginLeft: 5}]}
                        onPress={() => setModalVisible(false)}
                    >
                        <AppText style={{color: colors.light}} weight={400}>Cancel</AppText>
                    </TouchableOpacity>
                </View>
            </View>
        );
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
     * selects an image form image library and sets imageUri to it. 
     */
    const selectImage = async () => {
        try {
            const { assets } = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.5  
            }); 
            if (assets) {
                setImageUri(assets[0].uri)
            }
        } catch (error) {
            console.log('Error reading an image', error);
        }
    }

    return (
        <Screen 
            fullscreen={true}
            options={[navigation.camera, navigation.search]}
        >
            {/* new pup modal */}
            <ReactNativeModal animationIn={"fadeInUp"} animationOut={"fadeOutDown"} isVisible={modalVisible}>
                { renderModal() }
            </ReactNativeModal>

            {/* image header */}
            <ImageBackground
                source={require('../assets/images/sunset.png')}
                style={styles.image}
            >
                <AppText style={[styles.greeting,  {color: colors.primary}]} weight={500}>
                    Morning,
                </AppText>
                <AppText style={[styles.greeting,  {color: colors.shadow}]} weight={500}>
                    Amber!
                </AppText>
            </ImageBackground>

            {/* content */}
            <View style={styles.container}>
                {/* header */}
                <View style={styles.headerContainer}>
                    {/* header label */}
                    <View style={styles.header}>
                        <AppText style={styles.headerText} weight={500}>
                            Pups
                        </AppText>
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
                        scrollEnabled={scrollEnabled}
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
                            keyExtractor={(item) => item.key}
                            onDataChange={(pups) => {setPups(pups)}}
                            onDragEnd={() => setScrollEnabled(true)}
                            onDragStart={() => setScrollEnabled(false)}
                            renderItem={(item) => {
                                return (
                                    renderItem(item)
                                )
                            }}
                        />

                        {/* addition button, absolute position manually calculated */}
            
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
                                onPress={() => setModalVisible(true)}
                            />
                        </View>
                    </ScrollView>

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
    tempTextInputWrapper: {
        flex: 1,
        backgroundColor: colors.shade,
        borderRadius: 20,
        padding: 10,
        justifyContent: 'center',
        alsignItems: 'center'
    },




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
    }
})

export default HomeScreen;