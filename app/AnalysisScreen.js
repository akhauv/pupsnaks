import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, ScrollView, TouchableWithoutFeedback, Image, ImageBackgroundBase, Text } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import FormData from 'form-data';

import { AppText, Screen } from '../components';
import nav from '../config/nav';
import colors from '../config/colors';
import pups from '../config/pups';
import ReactNativeModal from 'react-native-modal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import supabase from '../config/supabase';

const allPups = [pups.Bear, pups.Roxi, pups.Rooney];
const toxicityLevels = ['safe', 'low', 'medium', 'high', 'conditional'];

// DELETE
const imgUri = '../assets/images/sample_1.jpeg';
const serverAddress = '18.218.56.242'; 
const ingredientsTemp = ['gluten free flour blend', 'organic light apricot flour', 'gluten free tea flower', 'chocolate flour', 'non gmp sunflower oil', 'organic light peanut brown brown brown borwn sugar'];

function AnalysisScreen() { 
    const [allIngredients, setAllIngredients] = useState(ingredientsTemp);
    const [activeIngredient, setActiveIngredient] = useState();
    const [informationModalVisible, setInformationModalVisible] = useState(false); 
    const [unknownModalVisible, setUnknownModalVisible] = useState(false); 
    const [allergyModalVisible, setAllergyModalVisible] = useState(false);
    const [pickerModalVisible, setPickerModalVisible] = useState(false)
    const [namesData, setNamesData] = useState();
    const [data, setData] = useState([])
    const [allergyData, setAllergyData] = useState({})
    const [activePup, setActivePup] = useState(-1); 

    const rgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    /* load image and send to API */

    // useEffect(() => {
    //     const getIngredientsList = async () => {            
    //         try {
    //             // ensure image exists 
    //             const loadedImage = Asset.fromModule(require(imgUri));
    //             await loadedImage.downloadAsync();

    //             const form = new FormData();
    //             form.append('file', {
    //                 uri: loadedImage.localUri,
    //                 type: 'image/jpeg',
    //                 name: 'image',
    //             });    
                
    //             const response = await axios.post("http://" + serverAddress + ":5000/extract", form, {
    //                 headers: {
    //                     'Content-Type': form.type,
    //                 }
    //             })

    //             const { ingredients } = response.data;
    //             const ingredientsArr = ingredients.split(', ');
    //             setAllIngredients(ingredientsArr)
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }
  
    //     getIngredientsList();
    // }, []);

    /* fetch names data */
    useEffect(() => {
        const fetchNamesData = async () => {
            const { data: initialData, error } = await supabase
                .from('substances')
                .select('name');
            if (error) {
                setNamesData([]);
                console.error(error.message);
            } else {
                const formattedData = initialData.map(ingredient => ingredient.name);
                setNamesData(formattedData);
            }
        };

        fetchNamesData();
    }, []);

    /* configure data when namesData or allIngredients changes */
    useEffect(() => {
        if (!namesData || !allIngredients) return;

        const configureData = async () => {
            try {
                const fetchedData = await Promise.all(allIngredients.map(async (ingredient) => {
                    const ingredientData = await fetchData(ingredient);
                    const ingredientStructure = { name: ingredient };

                    if (ingredientData) {
                        ingredientStructure.root = ingredientData.name;
                        ingredientStructure.alias = ingredientData.alias;
                        ingredientStructure.toxicity = ingredientData.toxicity;
                        ingredientStructure.description = ingredientData.description;
                    } else {
                        ingredientStructure.root = null;
                        ingredientStructure.alias = null;
                        ingredientStructure.toxicity = 'unknown';
                        ingredientStructure.description = null;
                    }

                    return ingredientStructure;
                }));

                setData(fetchedData);
            } catch (error) {
                console.error(error.message);
                console.error("failure to fetch data");
            }
        };

        configureData();
    }, [namesData, allIngredients]);

    /* configure allergies when data changes */
    useEffect(() => {
        if (!data) return;

        const configureAllergies = () => {
            const newAllergyData = {};

            /* loop through all existing ingredients data */ 
            for (const ingredient of data) {
                const root = ingredient.root ? ingredient.root : ingredient.name;
                const affectedPups = [];

                /* loop through each pup */
                for (let i = 0; i < allPups.length; i++) {
                    const thisPup = allPups[i];

                    /* loop through each allergy and see if root is in the allergy */
                    for (const allergy of thisPup.allergies) {
                        if (allergy.indexOf(root) !== -1) {
                            affectedPups.push(i);
                            break;
                        }
                    }
                }

                /* add affected pup and allergy to allergies data */
                if (affectedPups.length > 0) {
                    newAllergyData[ingredient.name] = affectedPups;
                }
            } 

            setAllergyData(newAllergyData);
        };

        configureAllergies();
    }, [data]);

    useEffect(() => {
        if (!activeIngredient) return;
        if (isActiveAllergy(activeIngredient)) setAllergyModalVisible(true);
        else if (activeIngredient.toxicity && activeIngredient.toxicity === 'unknown') setUnknownModalVisible(true);
        else setInformationModalVisible(true); 
    }, [activeIngredient])

    const fetchData = async (name) => {
        /* get matching general name to query and sort by matching length */ 
        const matchingNames = namesData
            .filter((substance) => name.indexOf(substance) !== -1)
            .sort((a, b) => b.length - a.length);
        if (matchingNames.length === 0) return null;
        const nameToQuery = matchingNames[0];

        /* query name with custom function and return alias, toxicity, and description. */
        const {data, error} = await supabase
            .rpc('get_toxicity_details', {q_name: nameToQuery});

        if (error) {
            console.error(error.message);
            return null;
        }

        /* add an extra name field */
        dataDict = data[0];
        dataDict.name = nameToQuery;
        
        return dataDict;
    }

    const renderAllergyModal = () => {
        if (!allergyData || !activeIngredient || !isActiveAllergy(activeIngredient)) return <></>;

        /* generate list of allergic pups */
        var allergicPups = [];
        for (var pupInd of allergyData[activeIngredient.name]) {
            allergicPups = [...allergicPups, allPups[pupInd]];
        }

        return (
            <View style={styles.modal}>

                {/* header */}
                <View style={[styles.modalHeader, {backgroundColor: colors.allergy}]}>
                    {/* close button */}
                    <TouchableOpacity style={styles.modalExit} onPress={() => setAllergyModalVisible(false)}>
                        <MaterialCommunityIcons color={colors.light} name="close" size={25} />
                    </TouchableOpacity>

                    {/* label */}
                    <AppText style={styles.modalHeaderText} numberOfLines={2} weight={500}>
                        { activeIngredient.name }
                    </AppText>
                </View>

                {/* information */}
                <ScrollView bounces={false} contentContainerStyle={[styles.modalTextWrapper, {paddingTop: 19}]}>
                    {activePup === -1 &&
                        <>
                            <AppText>
                                The following pups are allergic to { activeIngredient.name }:
                            </AppText>
                            
                            {/* list of allergic pups */}
                            <ScrollView bounces={false} style={styles.pupWrapper}>
                                {allergicPups.map((pup, index) => 
                                    <View key={index} style={styles.pupRow}>
                                        <MaterialCommunityIcons color={pup.color} name='circle' size={7} style={styles.pupBulletPoint} />
                                        <AppText style={{color: pup.color}}>{ pup.name }</AppText>
                                    </View>
                                )}
                            </ScrollView>
                        </>
                    }

                    {activePup !== -1 &&
                        <AppText>
                            {allPups[activePup].name} is allergic to { activeIngredient.name }.
                        </AppText>
                    }
                </ScrollView>
            </View>
        );
    }

    const isActiveAllergy = (ingredient) => {
        if (!(ingredient.name in allergyData)) return false; 

        // check whether the active allergy applies to this pup
        thisAllergy = allergyData[ingredient.name]; 
        if ((activePup === -1) || (activePup in thisAllergy)) return true;
        return false;
    }

    const renderItem = (item, index) => {
        return (
            <AppText key={index}>
                <AppText 
                    style={{
                        color: isActiveAllergy(item) ? colors['allergy'] : colors[item.toxicity],
                        flexWrap: 'wrap',
                        flexShrink: 1,
                    }}
                    weight={(item.toxicity === 'unknown' && !isActiveAllergy(item)) ? 100 : 300}
                    suppressHighlighting={true}

                    onPress={() => {
                        const deepCopy = JSON.parse(JSON.stringify(item));
                        setActiveIngredient(deepCopy); 
                    }}
                >
                    { item.name }
                </AppText>

                {index < data.length - 1 &&
                    <AppText style={{color: isActiveAllergy(item) ? colors['allergy'] : colors[item.toxicity]}}>, </AppText>
                }
            </AppText>
        );
    }

    const renderInformationModal = () => {
        if (!activeIngredient) return <></>; 

        return (
            <View style={styles.modal}>

                {/* header */}
                <View style={[styles.modalHeader, {backgroundColor: colors[activeIngredient.toxicity]}]}>
                    {/* close button */}
                    <TouchableOpacity style={styles.modalExit} onPress={() => setInformationModalVisible(false)}>
                        <MaterialCommunityIcons color={colors.light} name="close" size={25} />
                    </TouchableOpacity>

                    {/* label */}
                    <AppText style={styles.modalHeaderText} numberOfLines={2} weight={500}>
                        { activeIngredient.name }
                    </AppText>
                </View>

                {/* toxicity key */}
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

                {/* information */}
                <ScrollView bounces={false} contentContainerStyle={styles.modalTextWrapper}>
                    <AppText>
                        {activeIngredient.description}
                    </AppText>
                </ScrollView>
            </View>
        );
    }

    const renderUnknownModal = () => {
        return (
            <View style={styles.modal}>

                {/* header */}
                <View style={[styles.modalHeader, {backgroundColor: colors.unknown}]}>
                    {/* close button */}
                    <TouchableOpacity style={styles.modalExit} onPress={() => setUnknownModalVisible(false)}>
                        <MaterialCommunityIcons color={colors.light} name="close" size={25} />
                    </TouchableOpacity>

                    {/* label */}
                    <AppText style={styles.modalHeaderText} numberOfLines={2} weight={500}>
                        { activeIngredient.name }
                    </AppText>
                </View>

                {/* information */}
                <ScrollView bounces={false} contentContainerStyle={[styles.modalTextWrapper, {paddingTop: 19}]}>
                    <AppText>
                        We don't know the toxicity level of this ingredient. Apologies!
                    </AppText>
                </ScrollView>
            </View>
        );
    }

    const renderPickerModal = () => {
        return (
            <ScrollView bounces={false} style={styles.pickerModal}>
                <FlatList
                    contentContainerStyle={styles.pickerModalContent}
                    scrollEnabled={false}
                    data={allPups}
                    keyExtractor={(item, index) => key = index}
                    ListHeaderComponent={() =>
                        <TouchableOpacity
                            style={[styles.pickerButton, {backgroundColor: activePup === -1 ? rgba(colors.text, 0.05) : colors.shade}]}
                            onPress={() => {
                                setActivePup(-1);
                                setPickerModalVisible(false);
                            }}
                        >
                            <AppText weight={activePup === -1 ? 400 : 100}>All Pups</AppText>
                        </TouchableOpacity>
                    }
                    renderItem={({ item, index }) =>
                        <TouchableOpacity
                            style={[styles.pickerButton, {backgroundColor: activePup === index ? rgba(item.color, 0.05) : colors.shade}]}
                            onPress={() => {
                                setActivePup(index);
                                setPickerModalVisible(false);
                            }}
                        >
                            <AppText 
                                style={{color: item.color}}
                                weight={activePup === index ? 400 : 100}
                            >
                                { item.name }
                            </AppText>
                        </TouchableOpacity>
                } />
            </ScrollView>
        )
    }

    return (
        <Screen 
            options={[nav.camera, nav.search, nav.home]}
            style={styles.screenStyle}
        >
            {/* allergy modal */}
            {activeIngredient && 
                <ReactNativeModal
                    animationIn={'fadeInUp'}
                    animationOut={'fadeOutDown'}
                    backdropColor={colors.allergy}
                    backdropOpacity={0.55}
                    isVisible={allergyModalVisible}
                    onBackdropPress={() => setAllergyModalVisible(false)}
                >
                    { renderAllergyModal() }
                </ReactNativeModal>
            }

            {/* information modal */}
            {activeIngredient && 
                <ReactNativeModal
                    animationIn={'fadeInUp'}
                    animationOut={'fadeOutDown'}
                    backdropColor={colors[activeIngredient.toxicity]}
                    backdropOpacity={0.55}
                    isVisible={informationModalVisible}
                    onBackdropPress={() => setInformationModalVisible(false)}
                >
                    { renderInformationModal() }
                </ReactNativeModal>
            }

            {/* unkown modal */}
            {activeIngredient &&
                <ReactNativeModal
                    animationIn={'fadeInUp'}
                    animationOut={'fadeOutDown'}
                    backdropColor={colors.unknown}
                    backdropOpacity={0.55}
                    isVisible={unknownModalVisible}
                    onBackdropPress={() => setUnknownModalVisible(false)}
                >
                    { renderUnknownModal() }
                </ReactNativeModal>
            } 

            {/* picker modal */}
            <ReactNativeModal
                animationIn={'slideInUp'} 
                animationOut={'slideOutDown'}
                isVisible={pickerModalVisible} 
                backdropColor={colors.shade}
                backdropOpacity={0.3}
                onBackdropPress={() => setPickerModalVisible(false)}
            >
                { renderPickerModal() }
            </ReactNativeModal>

            {/* header */}
            <AppText style={styles.headerText} weight={500}>Ingredients</AppText>

            {/* picker */}
            <TouchableWithoutFeedback onPress={() => setPickerModalVisible(true)}>
                <View style={styles.pickerSelect}>
                    {activePup === -1 &&
                        <AppText style={styles.pickerSelectText}>All Pups</AppText>
                    }
                    {activePup !== -1 &&
                        <AppText style={[styles.pickerSelectText, {color: allPups[activePup].color}]}>
                            {allPups[activePup].name}
                        </AppText>
                    }

                    <MaterialCommunityIcons
                        name={"chevron-down"}
                        size={20}
                        style={[styles.pickerSelectIcon, {color: activePup === -1 ? colors.text : allPups[activePup].color}]}
                    />
                </View>
            </TouchableWithoutFeedback>        
        
            {/* analysis */}
            <ScrollView bounces={false} style={styles.ingredientsList} showsVerticalScrollIndicator={false}>
                <Text style={styles.listWrapper}>
                    {data.map((item, index) => renderItem(item, index))}
                </Text>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    ingredient: {
        paddingHorizontal: 3,
        paddingVertical: 1
    },
    ingredientsList: {
        marginTop: 30,
        overflow: 'scroll',
        width: '100%',
        marginBottom: 60,
    },
    headerText: {
        color: colors.secondary,
        fontSize: 30,
        marginBottom: 15,
        marginTop: 20,
        textTransform: 'uppercase'
    },
    listWrapper: {
        flexWrap: 'wrap',
        lineHeight: 23,
        width: '100%',
        paddingBottom: 40
    },
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
    pickerSelect: {
        borderRadius: 50,
        backgroundColor: colors.shade,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginLeft: -10,
        marginRight: -10
    },
    pickerSelectIcon: {
        marginVertical: 'auto',
        marginLeft: 'auto'
    },
    pickerSelectText: {
        fontSize: 19
    },
    pickerModal: {
        backgroundColor: colors.shade,
        borderRadius: 35,
        minHeight: 130,
        maxHeight: 250,
        width: '100%',
        position: 'absolute',
        bottom: 0
    },
    pickerButton: {
        width: '100%',
        paddingHorizontal: 25,
        paddingVertical: 10,
    },
    pickerModalContent: {
        height: '100%',
        width: '100%', 
        paddingVertical: 10
    },
    pickerModalWrapper: {
        justifyContent: 'flex-end',
        ...StyleSheet.absoluteFillObject
    },
    pupBulletPoint: {
        marginRight: 7,
        marginBottom: 2
    },
    pupRow: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 3
    },
    pupWrapper: {
        maxHeight: 150,
        paddingHorizontal: 10,
        paddingTop: 7
    },
    screenStyle: {
        paddingHorizontal: 30
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
        marginTop: 15,
        paddingHorizontal: 17,
        width: '100%'
    },
    toxicitySubRow: {
        alignItems: 'center', 
        flexDirection: 'row'
    }
})

export default AnalysisScreen;