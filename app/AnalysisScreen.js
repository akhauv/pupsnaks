import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';

import { AppText, Screen } from '../components';
import nav from '../config/nav';
import colors from '../config/colors';
import pups from '../config/pups';
import ReactNativeModal from 'react-native-modal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import supabase from '../config/supabase';
import { useFocusEffect } from '@react-navigation/native';

allIngredientsTemp = ['lorem', 'avocado spread', 'ipsum', 'apricot juice', 'dark chocolate', 'coffee bean extract', 'green tea leaves', 'dolor', 'sit', 'amet']

const allPups = [pups.Bear, pups.Roxi, pups.Rooney];
const toxicityLevels = ['safe', 'low', 'medium', 'high', 'conditional']

function AnalysisScreen() {
    const [allIngredients, setAllIngredients] = useState(allIngredientsTemp);
    const [activeIngredient, setActiveIngredient] = useState();
    const [informationModalVisible, setInformationModalVisible] = useState(false); 
    const [unknownModalVisible, setUnknownModalVisible] = useState(false); 
    const [allergyModalVisible, setAllergyModalVisible] = useState(false);
    const [namesData, setNamesData] = useState();
    const [data, setData] = useState([])
    const [allergyData, setAllergyData] = useState({})
    const [activePup, setActivePup] = useState(-1); 

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
        if (!namesData) return;

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

    const fetchDescription = async (alias) => {
        const {data, error} = await supabase
            .from('toxicities')
            .select('description')
            .eq('alias', alias);
        
        if (error) return null;
        return data[description];
    }

    const renderAllergyModal = () => {
        if (!allergyData || !activeIngredient || !isActiveAllergy(activeIngredient)) return;

        /* generate list of allergic pups */
        var allergicPups = [];
        for (var pupInd of allergyData[activeIngredient.name]) {
            allergicPups = [...allergicPups, allPups[pupInd]];
        }

        return (
            <View style={styles.modalWrapper}>
                <View style={styles.modal}>

                    {/* header */}
                    <View style={[styles.modalHeader, {backgroundColor: colors.allergy}]}>
                        {/* close button */}
                        <TouchableOpacity style={styles.modalExit} onPress={() => setAllergyModalVisible(false)}>
                            <MaterialCommunityIcons color={colors.light} name="close" size={25} />
                        </TouchableOpacity>

                        {/* label */}
                        <AppText style={styles.modalHeaderText} weight={500}>
                            { activeIngredient.name }
                        </AppText>
                    </View>

                    {/* information */}
                    <ScrollView contentContainerStyle={[styles.modalTextWrapper, {paddingTop: 19}]}>
                        <AppText>
                            The following pups are allergic to { activeIngredient.name }:
                        </AppText>

                        {/* list of allergic pups */}
                        <View style={styles.pupWrapper}>
                            {allergicPups.map((pup, index) => 
                                <View key={index} style={styles.pupRow}>
                                    <MaterialCommunityIcons color={pup.color} name='circle' size={7} style={styles.pupBulletPoint} />
                                    <AppText style={{color: pup.color}}>{ pup.name }</AppText>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>
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
            <TouchableOpacity 
                key={index}
                onPress={() => {
                    setActiveIngredient(item);
                }}
                style={styles.ingredient}>
                <AppText 
                    style={{color: isActiveAllergy(item) ? colors['allergy'] : colors[item.toxicity]}}
                    weight={(item.toxicity === 'unknown' && !isActiveAllergy(item)) ? 100 : 300}
                >
                    { item.name }
                </AppText>
            </TouchableOpacity>
        );
    }

    const renderInformationModal = () => {
        if (!activeIngredient) return; 

        return (
            <View style={styles.modalWrapper}>
                <View style={styles.modal}>

                    {/* header */}
                    <View style={[styles.modalHeader, {backgroundColor: colors[activeIngredient.toxicity]}]}>
                        {/* close button */}
                        <TouchableOpacity style={styles.modalExit} onPress={() => setInformationModalVisible(false)}>
                            <MaterialCommunityIcons color={colors.light} name="close" size={25} />
                        </TouchableOpacity>

                        {/* label */}
                        <AppText style={styles.modalHeaderText} weight={500}>
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
                    <ScrollView contentContainerStyle={styles.modalTextWrapper}>
                        <AppText>
                            {activeIngredient.description}
                        </AppText>
                    </ScrollView>
                </View>
            </View>
        );
    }

    const renderUnknownModal = () => {
        return (
            <View style={styles.modalWrapper}>
                <View style={styles.modal}>

                    {/* header */}
                    <View style={[styles.modalHeader, {backgroundColor: colors.unknown}]}>
                        {/* close button */}
                        <TouchableOpacity style={styles.modalExit} onPress={() => setUnknownModalVisible(false)}>
                            <MaterialCommunityIcons color={colors.light} name="close" size={25} />
                        </TouchableOpacity>

                        {/* label */}
                        <AppText style={styles.modalHeaderText} weight={500}>
                            { activeIngredient.name }
                        </AppText>
                    </View>

                    {/* information */}
                    <ScrollView contentContainerStyle={[styles.modalTextWrapper, {paddingTop: 19}]}>
                        <AppText>
                            We don't know the toxicity level of this ingredient. Apologies!
                        </AppText>
                    </ScrollView>
                </View>
            </View>
        );
    }

    return (
        <Screen 
            options={[nav.camera, nav.search, nav.home]}
            style={styles.screenStyle}
        >
            {/* allergy modal */}
            {activeIngredient && 
                <ReactNativeModal animationIn={'fadeInUp'} animationOut={'fadeOutDown'} backdropColor={colors.allergy} backdropOpacity={0.55} isVisible={allergyModalVisible}>
                    { renderAllergyModal() }
                </ReactNativeModal>
            }

            {/* information modal */}
            {activeIngredient && 
                <ReactNativeModal animationIn={'fadeInUp'} animationOut={'fadeOutDown'} backdropColor={colors[activeIngredient.toxicity]} backdropOpacity={0.55} isVisible={informationModalVisible}>
                    { renderInformationModal() }
                </ReactNativeModal>
            }

            {/* unkown modal */}
            {activeIngredient &&
                <ReactNativeModal animationIn={'fadeInUp'} animationOut={'fadeOutDown'} backdropColor={colors.unknown} backdropOpacity={0.55} isVisible={unknownModalVisible}>
                    { renderUnknownModal() }
                </ReactNativeModal>
            } 

            {/* header */}
            <AppText style={styles.headerText} weight={500}>Ingredients</AppText>

            {/* picker */}
            <View style={{height: 50, borderRadius: 50, backgroundColor: colors.shade, marginLeft: -10, marginRight: -10}} />

            {/* analysis */}
            <View style={styles.ingredientsList}>
                {data.map((item, index) => renderItem(item, index))}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    ingredient: {
        paddingHorizontal: 3,
        paddingVertical: 1
    },
    ingredientsList: {
        alignContent: 'space-between',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 30,
        overflow: 'scroll',
        width: '100%'
    },
    headerText: {
        color: colors.secondary,
        fontSize: 30,
        marginBottom: 15,
        marginTop: 20,
        textTransform: 'uppercase'
    },
    modal: {
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: colors.light,
        overflow: 'hidden',
        width: '95%'
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
        width: '100%'
    },
    modalHeaderText: {
        color: colors.light,
        fontSize: 20,
        textTransform: 'capitalize', 
    },
    modalTextWrapper: {
        maxHeight: 220,
        paddingBottom: 20,
        paddingHorizontal: 25,
        paddingTop: 15,
        width: '100%'
    },
    modalWrapper: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 80
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