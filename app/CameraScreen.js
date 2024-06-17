import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View, FlatList, Dimensions } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText } from '../components';
import colors from '../config/colors';
import pups from '../config/pups';

// DELETE!!!!
const allPups = [{name: "All Pups"}, pups.Bear, pups.Roxi, pups.Rooney, pups.place1, pups.place2, pups.place3, pups.place4];

/*
 *  Other Costants
 */
const PICKER_MARGIN = 20;

function CameraScreen() {
    const [firstItemWidth, setFirstItemWidth] = useState(null);     // used to calculate padding of pupPicker
    const [lastItemWidth, setLastItemWidth] = useState(null);       // used to calculate padding of pupPicker
    const [offsetMap, setOffsetMap] = useState({});                 // map of offsets to pupPicker indices
    const [selectedIndex, setSelectedIndex] = useState(0);          // currently selected for pupPicker
    const [snapOffsets, setSnapOffsets] = useState([]);             // offset snaps for pupPicker

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
                style={{color: index === selectedIndex ? colors.light : colors.primary}}
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
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        backgroundColor: 'black',
        ...StyleSheet.absoluteFillObject
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
        width: '100%',
        paddingVertical: 10,
    }
})

export default CameraScreen;
