import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View, FlatList, Dimensions } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { AppText, Icon } from '../components';
import colors from '../config/colors';
import pups from '../config/pups';
import { Button } from 'react-native';

// DELETE!!!!
const allPups = [{name: "All Pups"}, pups.Bear, pups.Roxi, pups.Rooney, pups.place1, pups.place2, pups.place3, pups.place4];

/*
 *  Other Costants
 */
const PICKER_MARGIN = 20;

function CameraScreen() {
    const [firstItemWidth, setFirstItemWidth] = useState(null);     // used to calculate padding of pupPicker
    const [imageUri, setImageUri] = useState("hehe");                     // image uri of taken picture
    const [lastItemWidth, setLastItemWidth] = useState(null);       // used to calculate padding of pupPicker
    const [offsetMap, setOffsetMap] = useState({});                 // map of offsets to pupPicker indices
    const [permission, requestPermission] = useCameraPermissions(); // camera permissions
    const [selectedIndex, setSelectedIndex] = useState(0);          // currently selected for pupPicker
    const [snapOffsets, setSnapOffsets] = useState([]);             // offset snaps for pupPicker

    /* 
     *  set up camera usage
     */
    /* camera permissions are still loadng */
    if (!permission) {
        return <View />;
    }
    
    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <AppText style={{ textAlign: 'center' }}>We need your permission to show the camera</AppText>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }
    

    /*
     *  calculates the padding needed to center the first and last pupPicker items
     */
    const calculatePadding = (width) => {
        return (Dimensions.get('window').width - width) / 2; 
    }

    /*
     *  updates the active pupPicker selected item color
     */
    const handleScroll = (event) => {
        let offset = event.nativeEvent.contentOffset.x;

        /* calculate closest offset to current position  */
        let closest = snapOffsets[0];
        for (let i in snapOffsets) {
            if (Math.abs(offset - snapOffsets[i]) < Math.abs(offset - closest))
                closest = snapOffsets[i];
        }
    
        /* map the closest offset position to its corresponding index */
        setSelectedIndex(parseInt(offsetMap[closest]));
    }
    
    /*
     *  Every time the layout changes, calculates item widths and offsets for pupPicker
     */ 
    const onItemLayout = (event) => {
        if (snapOffsets.length === allPups.length) return;

        /* calculate item widths */ 
        const { width } = event.nativeEvent.layout;

        /* use width to calculate offsets */ 
        let ind = snapOffsets.length; 
        let cumulativeOffset = (ind > 0) ? snapOffsets[ind - 1] : 0
        let offset = cumulativeOffset +
                     (lastItemWidth ? (lastItemWidth / 2) : 0) + 
                     ((ind > 0) ? PICKER_MARGIN : 0) +
                     ((ind > 0) ? (width / 2) : 0);

        /* update snap offset */
        setSnapOffsets([...snapOffsets, offset]);

        /* update offset and index mapping */
        let offsetMapBuilder = offsetMap;
        offsetMapBuilder[offset] = ind;
        setOffsetMap(offsetMapBuilder);

        if (!firstItemWidth) setFirstItemWidth(width); 
        setLastItemWidth(width); 
    };

    /*
     *  renders a pupPicker item
     */

    const renderItem = ({ item, index }) => (
        <View onLayout={(event) => onItemLayout(event)}>
            <AppText
                key={index}
                style={{color: index === selectedIndex ? colors.light : colors.primary, fontSize: 19}}
                weight={500}
            >
                {item.name}
            </AppText>
        </View>
    );

    return (
        <View style={styles.background}>
            <SafeAreaView>
                {/* header */}
                <View style={styles.headerRow}>

                    {/* close button */}
                    <TouchableOpacity style={styles.exitButton}>
                        <MaterialCommunityIcons color={colors.light} name="close" size={30} />
                    </TouchableOpacity>

                    {/* label */}
                    <AppText style={styles.headerText} weight={500}>Ingredients Cam</AppText>

                </View>

                {/* camera */}
                <View style={{height: 500}}>
                <CameraView style={{flex: 1}} facing={'back'}>
                    
                </CameraView></View>

                {/* pup picker */}
                <FlatList
                    bounces={false}
                    contentContainerStyle={{
                        paddingLeft: calculatePadding(firstItemWidth),
                        paddingRight: calculatePadding(lastItemWidth)
                    }}
                    decelerationRate={"fast"}
                    horizontal={true}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}

                    data={allPups}
                    ItemSeparatorComponent={<View style={{width: PICKER_MARGIN}}/>}
                    onScroll={handleScroll}
                    renderItem={renderItem}
                    snapToOffsets={snapOffsets}
                />

                {/* bottom content */}
                <View style={styles.bottomRow}>
                    {/* take image button  */}
                    {!imageUri &&
                        <Icon 
                            backgroundColor={colors.high}
                            borderColor={colors.light}
                            borderWidth={4}
                            icon={"blank"}
                            size={70}
                        />
                        
                    }

                    {/* proceed or retake display */}
                    {imageUri &&
                        <>
                            <Icon 
                                backgroundColor={colors.shadow}
                                borderColor={colors.shadow}
                                borderWidth={4}
                                color={'black'}
                                icon={"refresh"}
                                iconSize={50}
                                size={65}
                                style={styles.retakeButton}
                            />
                            <View style={styles.proceedButton}>
                                <MaterialCommunityIcons color={colors.light} name={"check-bold"} size={40}/>
                                <AppText style={styles.proceedText} weight={500}>
                                    Let's Go!
                                </AppText>
                            </View>
                        </>
                    }
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        backgroundColor: 'black',
        ...StyleSheet.absoluteFillObject
    },
    bottomRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 'auto',
        marginTop: 25, 
        width: '100%'
    },
    exitButton: {
        position: 'absolute',
        left: 10
    },
    headerText: {
        color: colors.light,
        fontSize: 25,
        flex: 1,
        textAlign: 'center',
    },
    headerRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 10,
        width: '100%',
    },
    proceedButton: {
        alignItems: 'center',
        backgroundColor: colors.tertiary,
        borderBottomLeftRadius: 35,
        borderTopLeftRadius: 35,
        flex: 1,
        flexDirection: 'row',
        height: 65,
        paddingLeft: 13
    },
    proceedText: {
        color: colors.light,
        fontSize: 26, 
        marginLeft: 30
    },
    retakeButton: {
        marginHorizontal: 20
    }
})

export default CameraScreen;
