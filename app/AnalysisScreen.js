import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';

import { AppText, Screen } from '../components';
import navigation from '../config/navigation';
import colors from '../config/colors';
import pups from '../config/pups';
import ReactNativeModal from 'react-native-modal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import supabase from '../config/supabase';
import { useFocusEffect } from '@react-navigation/native';

allIngredientsTemp = ['lorem', 'avocado spread', 'ipsum', 'apricot juice', 'dark chocolate', 'coffee bean extract', 'green tea leaves', 'dolor', 'sit', 'amet']
// DELETE
// const data = [{name: 'lorem', toxicity: 'unknown'},
//               {name: 'ipsum', toxicity: 'high'}, 
//               {name: 'dolor', toxicity: 'medium'}, 
//               {name: 'sit', toxicity: 'low'},
//               {name: 'amet', toxicity: 'safe'},
//               {name: 'consecteteur', toxicity: 'conditional'},
//               {name: 'adipiscing', toxicity: 'allergy', pups: [0, 1]},
//               {name: 'elit', toxicity: 'unknown'},
//               {name: 'lorem', toxicity: 'unknown'},
//               {name: 'ipsum', toxicity: 'high'}, 
//               {name: 'dolor', toxicity: 'medium'}, 
//               {name: 'sit', toxicity: 'low'},
//               {name: 'amet', toxicity: 'safe'},
//               {name: 'consecteteur', toxicity: 'conditional'},
//               {name: 'adipiscing', toxicity: 'allergy', pups: [0, 1]},
//               {name: 'elit', toxicity: 'unknown'},
//               {name: 'lorem', toxicity: 'unknown'},
//               {name: 'ipsum', toxicity: 'high'}, 
//               {name: 'dolor', toxicity: 'medium'}, 
//               {name: 'sit', toxicity: 'low'},
//               {name: 'amet', toxicity: 'safe'},
//               {name: 'consecteteur', toxicity: 'conditional'},
//               {name: 'adipiscing', toxicity: 'allergy', pups: [0, 1]},
//               {name: 'elit', toxicity: 'unknown'},
//               {name: 'lorem', toxicity: 'unknown'},
//               {name: 'ipsum', toxicity: 'high'}, 
//               {name: 'dolor', toxicity: 'medium'}, 
//               {name: 'sit', toxicity: 'low'},
//               {name: 'amet', toxicity: 'safe'},
//               {name: 'consecteteur', toxicity: 'conditional'},
//               {name: 'adipiscing', toxicity: 'allergy', pups: [0, 1]},
//               {name: 'elit', toxicity: 'unknown'},
//               {name: 'lorem', toxicity: 'unknown'},
//               {name: 'ipsum', toxicity: 'high'}, 
//               {name: 'dolor', toxicity: 'medium'}, 
//               {name: 'sit', toxicity: 'low'},
//               {name: 'amet', toxicity: 'safe'},
//               {name: 'consecteteur', toxicity: 'conditional'},
//               {name: 'adipiscing', toxicity: 'allergy', pups: [0, 1]},
//               {name: 'elit', toxicity: 'unknown'}];
const allPups = [pups.Bear, pups.Roxi, pups.Rooney];

const toxicityLevels = ['safe', 'low', 'medium', 'high', 'conditional']

function AnalysisScreen() {
    const [allIngredients, setAllIngredients] = useState(allIngredientsTemp);
    const [activeIngredient, setActiveIngredient] = useState();
    const [informationModalVisible, setInformationModalVisible] = useState(false); 
    const [unknownModalVisible, setUnknownModalVisible] = useState(true); 
    const [allergyModalVisible, setAllergyModalVisible] = useState(false);
    const [namesData, setNamesData] = useState();
    const [data, setData] = useState([])

    /* load all names beforehand for time efficiency and initialize realtime subscirption */
    useEffect(() => {
        // Handle data changes in the substances table
        const handleUpdate = (payload) => {
            // Update local state with new data
            setNamesData(payload.new)
        };
    
        // Set up real-time subscription
        const subscription = supabase
            .from('substances')
            .on('*', handleUpdate) // Listen for all changes (inserts, updates, deletes)
            .subscribe();
    
        // Fetch names data
        const fetchNamesData = async () => {
            const { data: initialData, error } = await supabase
                .from('substances')
                .select('names');
            if (error) {
                setData([]);
            } else {
                setData(initialData);
            }
        };
    
        fetchNamesData();
    
        // Cleanup on component unmount
        return () => {
          supabase.removeSubscription(subscription);
        };
    }, []);

    /* create data map */
    useEffect(() => {
        const configureData = async () => {
            try {
                for (ingredient in allIngredients) {
                    const ingredientData = await(fetchData(ingredient));
                    const ingredientStructure = {
                        name: ingredient,
                        alias: ingredientData.alias,
                        toxicity: ingredientData.toxicity
                    };
                    setData([...data, ingredientStructure]);
                }
            } catch (error) {
                console.error("failure to fetch data");
            }
        }

        configureData();
    }, [allIngredients]);

    const fetchData = async (name) => {
        /* get matching general name to query and sort by matching length */ 
        const matchingNames = namesData
            .filter(posName => name.includes(posName))
            .sort((a, b) => b.length - a.length);
        if (matchingNames.length === 0) return null;
        const nameToQuery = matchingNames[0];

        /* query name with custom function and return alias, toxicity, and description. */
        const {data, error} = await supabase
            .rpc('get_toxicity_details', {nameToQuery});

        if (error) return null;
        return data;
    }

    const fetchDescription = async (alias) => {
        const {desc, error} = await supabase
            .from('toxicities')
            .select('description')
            .eq('alias', alias);
        
        if (error) return null;
        return data;
    }

    const renderAllergyModal = () => {
        /* generate list of allergic pups */
        var allergicPups = [];
        for (var i in activeIngredient.pups) {
            allergicPups = [...allergicPups, allPups[activeIngredient.pups[i]]];
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

    const renderItem = (item, index) => {
        return (
            <TouchableOpacity 
                key={index}
                onPress={() => {
                    setActiveIngredient(item);
                    if (item.toxicity === 'allergy') setAllergyModalVisible(true);
                    else if (item.toxicity === 'unknown') setUnknownModalVisible(true);
                    else setInformationModalVisible(true); 
                }}
                style={styles.ingredient}>
                <AppText 
                    style={{color: colors[item.toxicity]}}
                    weight={item.toxicity === 'unknown' ? 100 : 300}
                >
                    { item.name }
                </AppText>
            </TouchableOpacity>
        );
    }

    const renderInformationModal = () => {
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
                            Linking requires a build-time setting `scheme`
                            in the project's Expo config (app.config.js or
                            app.json) for production apps, if it's left blank, 
                            your app may crash. The scheme does not apply to 
                            development in the Expo client but you should add 
                            it as soon as you start working with Linking to avoid 
                            creating a broken build. Learn more: https://docs.expo.
                            dev/guides/linking/
                            Linking requires a build-time setting `scheme`
                            in the project's Expo config (app.config.js or
                            app.json) for production apps, if it's left blank, 
                            your app may crash. The scheme does not apply to 
                            development in the Expo client but you should add 
                            it as soon as you start working with Linking to avoid 
                            creating a broken build. Learn more: https://docs.expo.
                            dev/guides/linking/
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
            options={[navigation.camera, navigation.search, navigation.home]}
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